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
import { doc, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "../../firebase_config";
import { useData } from "../../providers/DataProvider";
import { calculateStockByDays } from "../../components/stock/salesAndStock";
import { changeDefaultQuinzaine } from "./QuinzainesTable";
import LinearWithValueLabel from "../../components/LinearWithValueLabel";

type Article = {
  available: boolean;
  stock: number;
  creation_date: {
    seconds: number;
    nanoseconds: number;
  };
  number_in_container: number;
  updated_time?: {
    seconds: number;
    nanoseconds: number;
  } | null;
  tag: string[];
  format: number;
  type: string;
  degree: number;
  article_type: number;
  id_delsart: number;
  has_barcode: boolean;
  price_out: number;
  barcode: string;
  name: string;
  edition: number;
  articleTransactions: Record<
    string,
    Record<string, { sales?: number; stock?: number }>
  >;
  price_in: number;
  sales: number;
};

type Articles = Record<string, Article>; // Maps article IDs to Article objects

// Utility function to split an object into chunks
function splitObjectIntoChunks<T>(
  obj: Record<string, T>,
  chunkSize: number
): Record<string, T>[] {
  const entries = Object.entries(obj); // Get entries from the object
  const result: Record<string, T>[] = []; // To store the chunks of objects

  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize); // Slice entries into chunks
    result.push(Object.fromEntries(chunk)); // Convert each chunk back into an object and store it
  }

  return result; // Return the array of chunked objects
}

function nextYear(year: string) {
  try {
    const [_startYear, endYear] = year.split("-");
    return `${Number(endYear)}-${Number(endYear) + 1}`;
  } catch (error) {
    return "1111-2222";
  }
}

type ModifiedArticle = Omit<Article, 'articleTransactions' | 'price_in' | 'sales' | 'stock'>;

// Function to create a new object without specific fields
function removeFieldsFromArticles(articles: Articles): Record<string, ModifiedArticle> {
  const modifiedArticles: Record<string, ModifiedArticle> = {};

  Object.entries(articles).forEach(([articleId, articleData]) => {
    // Create a copy of the article excluding certain fields
    const { articleTransactions, price_in, sales, stock, ...rest } = articleData;

    // Add the modified article to the new object
    modifiedArticles[articleId] = rest;
  });

  return modifiedArticles;
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
  const [loadingProgress, setLoadingProgress] = useState(0);

  const txtlenght1 = 15;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (error) {
      timer = setTimeout(() => {
        setError("");
      }, 50000); // Set the timer to hide the error after 5 seconds
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
    // check if maxEdition == currentEdition (should be okay but better double check)
    const Data = await refetchQuinzaineData(); //it get us private, 15n and public data. The "await" is necessary, dont listen to the editor, he is lying.
    // check if the data is recent
    if (Data == null) {
      setError(
        "Erreur lors de la récupération des données. Aucune donnée n'a été écrite"
      );
      setErrorSeverity("error");
      setLoading(false);
      return;
    }
    const maxEdition = Data.get("maxEdition");
    const currentEdition = Data.get("currentEdition");
    //const defaultEdition = Data.get("defaultEdition");

    if (maxEdition !== currentEdition) {
      // edge case, really should not happen
      setError(
        "Erreur: Impossible de créer une nouvelle quinzaine. La quinzaine actuelle n'est pas la dernière quinzaine. Aucune donnée n'a été écrite"
      );
      setErrorSeverity("error");
      setLoading(false);
      return;
    }

    const articles = Object.fromEntries(Data.get("articles"));

    const articlesCount = Object.keys(articles).length;

    if (articlesCount === 0) {
      setError(
        "Erreur: Aucun article trouvé dans la quinzaine actuelle. Aucune donnée n'a été écrite"
      );
      setErrorSeverity("error");
      setLoading(false);
      return;
    }
    console.log("articles: ", articles);

    // TODO
    // 1. Create new 15n document
    // 2. Create the public document (easy), type, tag, edition, active, articles, average_stock_update_time
    // 3. Create the new private documents. Calculate new initStock

    const new15nDoc = {
      author: autor,
      creation_date: Timestamp.now(),
      edition: maxEdition + 1,
      transactions: {},
      year: nextYear(Data.get("15n").get(maxEdition).year),
    };

    const publicArticles = removeFieldsFromArticles(articles);

    const newPublicDoc = {
      active: true,
      edition: maxEdition + 1,
      articles: publicArticles, //Errors with tag and type. Need to fix, todo
      average_stock_update_time: 0,
      tag: Data.get("tag"),
      type: Data.get("type"),
    };
    const newEdition = maxEdition + 1;

    try {
      const chunkedArticles = splitObjectIntoChunks(articles, 150);
      console.log("chunkedArticles: ", chunkedArticles);

      let i = 0;

      chunkedArticles.forEach(async (chunk, chunkIndex) => {
        console.log(`Chunk ${chunkIndex + 1}:`);
        const batch = writeBatch(db);

        // Iterate over each article in the chunk
        Object.entries(chunk).forEach(([articleId, articleData]) => {
          //console.log(`Article ID: ${articleId}`);
          //console.log("Article Data:", articleData);
          const article = articleData;
          let stockFinal = 0;
          try {
            const stockAndSales = calculateStockByDays(
              article.articleTransactions,
              null,
              article.stock,
              article.number_in_container
            );
            stockFinal = stockAndSales[3];
          } catch (error) {
            console.log("Error calculating stock: ", error);
          }
          const newArticleRef = doc(
            db,
            `Private/${newEdition}/articles/${articleId}`
          );
          batch.set(newArticleRef, {
            price_in: article.price_in || 0,
            initStock: stockFinal || 0, //todo
            sales: 0,
            stock: stockFinal || 0, //same as initStock
            edition: newEdition,
            articleTransactions: {},
          });
        });
        if (i === 0) {
          const new15nRef = doc(db, `Quinzaines/${newEdition}`);
          batch.set(new15nRef, new15nDoc);

          const newPublicRef = doc(db, `Public/${newEdition}`);
          batch.set(newPublicRef, newPublicDoc);
        }

        await batch.commit();
        i++;
        setLoadingProgress((i / chunkedArticles.length) * 100);
        console.log("Batch commit ", i);
      });

      await changeDefaultQuinzaine(newEdition);
      await refetchQuinzaineData();
      setAutor("");
      setErrorSeverity("success");
      setError("La quinzaine a été créée avec succès");
      setLoading(false);
      return;
    } catch (error) {
      setErrorSeverity("error");
      setError("Erreur lors de la création de la quinzaine: " + error);
      setLoading(false); // error handeling is not working, need to fix, todo
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
            Créer la {quinzaineData?.get("maxEdition") + 1}éme quinzaine
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
                Nom du chef 15n. Max {txtlenght1} characters. {autor.length}/
                {txtlenght1}
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
                Créer la {quinzaineData?.get("maxEdition") + 1}éme quinzaine
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
          {loading && <LinearWithValueLabel progress={loadingProgress} />}
        </CardContent>
      </Card>
    </>
  );
}

//FirebaseError: [code=invalid-argument]: Function WriteBatch.set() called with invalid data. Unsupported field value: a custom Map object (found in field articles in document Public/91)
