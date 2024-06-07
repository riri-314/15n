import LoadingButton from "@mui/lab/LoadingButton";
import {
  Alert,
  AlertColor,
  CardContent,
  FormHelperText,
  Grid,
  TextField,
} from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase_config";
import { useData } from "../../providers/DataProvider";

function nextYear(year: string) {
  const [_startYear, endYear] = year.split("-");
  return `${Number(endYear)}-${Number(endYear) + 1}`;
}

export default function NewQuinzaine() {
  const { quinzaineData, refetchQuinzaineData } = useData();
  const [autor, setAutor] = useState("");
  const [autorError, setAutorError] = useState(false);
  const [error, setError] = useState("");
  const [errorSeverity, setErrorSeverity] = useState<AlertColor | undefined>(
    "error"
  );
  const [loading, setLoading] = useState(false);

  const txtlenght1 = 15;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (error) {
      timer = setTimeout(() => {
        setError("");
      }, 5000); // Set the timer to hide the error after 5 seconds
    }

    return () => {
      clearTimeout(timer);
    };
  }, [error]);

  async function handleNew15n() {
    setLoading(true);
    // Fetch quinzaineData
    // add option to refetch 15n data tpo not chnge the data state, so i can  compare that the data is the same, else throw error
    // dont need to fetch articles in the dataprovider. Will be fetched here
    //
    // fetch all Private.maxId.articles, save doc?id and doc.data() in a object
    // fetch all Public docs where edition == maxId, save doc.data() in a object
    //
    // Private: create YYth doc with {author, creation_date, transactions, year}
    //  -> copy 300 docs at a time @ private.maxId+1.articles, writebatch loop until all docs are copied
    //  -> modifie some fields of this docs {added_stock=0, sales=0, stock=stock, stock_init=stock, transactions={}}
    //
    // Public:
    //  -> wriebatch all docs
    //  -> modifie some fields, {active=true, edition=maxId+1, article.new=false}

    if (autor.length == 0 || autor.length > txtlenght1) {
      setErrorSeverity("error");
      setError("Error: Autor name is invalid");
      setLoading(false);
      return;
    }
    const oldMaxId = quinzaineData?.get("maxId");
    const Data = await refetchQuinzaineData(); //it get us private, 15n and public data. The "await" is necessary, dont listen to the editor, he is lying.
    if (!Data) {
      setError("Error fetching data. No data was written");
      setErrorSeverity("error");
      setLoading(false);
      return;
    }
    const maxId = Data.get("maxId");
    if (maxId !== oldMaxId) {
      // edge case, really should not happen
      setError(
        "Mismatch quinzaine ID, please reload the app to fix the error. No data was written"
      );
      setErrorSeverity("error");
      setLoading(false);
      return;
    }
    const articles = Data.get("15n").get(maxId).articles;
    const articlesCount = Object.keys(articles).length;
    if (articlesCount === 0) {
      setError("No articles found in the last quinzaine. No data was written");
      setErrorSeverity("error");
      setLoading(false);
      return;
    }
    console.log("articles: ", articles);

    const groupedArticles: Record<string, any> = {};
    const groupedArticles2: Record<string, any> = {};
    const groupedArticles3: Record<string, any> = {};

    let i = 0;
    const keys = Object.keys(articles);
    keys.forEach((key) => {
      const groupIndex = Math.floor(i / 1000);
      if (!groupedArticles3[groupIndex]) {
        groupedArticles3[groupIndex] = {
          article_count: 0,
          articles: {},
          active: true,
          edition: maxId + 1,
          data_saver: false,
        };
      }
      const article = articles[key];
      delete article.added_stock;
      delete article.sales;
      delete article.transactions;
      delete article.updated_on;
      delete article.price_in;
      delete article.stock_init;
      delete article.stock;
      article.new = false;
      groupedArticles3[groupIndex].articles[key] = article; // need to remove some data from the articles
      groupedArticles3[groupIndex].article_count = (i % 1000) + 1;
      const privDoc = articles[key].privDoc;
      if (!groupedArticles[privDoc]) {
        groupedArticles[privDoc] = {};
      }
      groupedArticles[privDoc][key] = articles[key];
      i += 1;
    });

    const groupedKeys = Object.keys(groupedArticles);
    groupedKeys.forEach((key, index) => {
      const groupIndex = Math.floor(index / 100);
      if (!groupedArticles2[groupIndex]) {
        groupedArticles2[groupIndex] = {};
      }
      groupedArticles2[groupIndex][key] = groupedArticles[key];
    });

    console.log(groupedArticles2);
    console.log(groupedArticles3);
    //setLoading(false);
    //return;

    // a public articles doc can store 1000 articles, so we need to split the articles in groups of 1000
    // we need to create new public doc(s) and update add the articles

    try {
      for (let i = 0; i < Object.keys(groupedArticles2).length; i += 1) {
        const batch = writeBatch(db);
        if (i === 0) {
          const new15n = {
            author: autor,
            creation_date: serverTimestamp(),
            year: nextYear(Data.get("15n").get(maxId).year),
            transactions: {},
          };
          console.log("new15n: ", new15n);
          batch.set(doc(db, "Private", String(maxId + 1)), new15n);
        }
        const batchArticles = groupedArticles2[i];
        console.log("batch: ", i, " groupedArticles2: ", groupedArticles2[i]);

        for (const key in batchArticles) {
          // key is the priv doc id
          let articleCount = 0;
          let articles: Record<string, any> = {};
          for (const articleId in batchArticles[key]) {
            //article is the article object
            const article = batchArticles[key][articleId];
            const newArticle = {
              added_stock: 0,
              sales: 0,
              stock: article.stock || 0,
              stock_init: article.stock || 0,
              price_in: article.price_in || 0,
              updated_on: article.updated_on || serverTimestamp(),
              transactions: {},
            };
            articleCount += 1;
            console.log("newArticle: ", newArticle);
            articles[articleId] = newArticle;
          }
          batch.set(
            doc(db, "Private", String(maxId + 1), "articles", String(key)),
            {
              article_count: articleCount,
              articles: articles,
            }
          );
        }
        await batch.commit();
      }

      for (let i = 0; i < Object.keys(groupedArticles3).length; i += 1) {
        const batch = writeBatch(db);
        let ref = doc(collection(db, "Public"));
        console.log("batch: ", i, " groupedArticles3: ", groupedArticles3[i]);
        batch.set(ref, groupedArticles3[i]);
        await batch.commit();
      }
      // set maxId + 1 as active quinzaine
      const collectionRef = collection(db, "Public");

      // Create a query to get all documents in the collection
      const q = query(collectionRef);

      // Get all documents matching the query
      const querySnapshot = await getDocs(q);

      // Run a transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        querySnapshot.forEach((document) => {
          const docData = document.data();
          const docRef = doc(db, "Public", document.id);

          if (docData.edition === Number(maxId + 1)) {
            // Update the field
            transaction.update(docRef, {
              active: true,
            });
          } else {
            // Update the field
            transaction.update(docRef, {
              active: false,
            });
          }
        });
      });
      // await refresh data to latest version
      await refetchQuinzaineData();
      setAutor("");
      setError("15n updated successfully");
      setErrorSeverity("success");
      setLoading(false);
      return;
    } catch (error) {
      setError("Error updating documents: " + error);
      setErrorSeverity("error");
      setLoading(false);
      return;
    }

    //await new Promise((resolve) => setTimeout(resolve, 6000));
  }

  return (
    <>
      <Card
        sx={{
          width: "100%",
          mb: 4,
          ml: "auto",
          mr: "auto",
          boxShadow: 0,
          border: 1,
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Create the {quinzaineData?.get("maxId") + 1}th quinzaine
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                error={autorError}
                label="Autor"
                value={autor}
                fullWidth
                onChange={(e) => {
                  let value = e.target.value;
                  if (value.length <= txtlenght1) {
                    setAutor(value);
                  }
                  if (value.length == 0) {
                    setAutorError(true);
                  } else {
                    setAutorError(false);
                  }
                }}
              />
              <FormHelperText>
                Name of the chef 15n. Max {txtlenght1} character. {autor.length}
                /{txtlenght1}
              </FormHelperText>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LoadingButton
                size="large"
                variant="contained"
                fullWidth
                onClick={handleNew15n}
                loading={loading}
                sx={{ height: "70%" }}
              >
                Create 15n
              </LoadingButton>
            </Grid>
          </Grid>
          {error && (
            <Alert
              sx={{ mt: 3 }}
              severity={errorSeverity}
              onClose={() => {
                setError("");
              }}
            >
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </>
  );
}
