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
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase_config";
import { useData } from "../../providers/DataProvider";

function nextYear(year: string) {
  const [_startYear, endYear] = year.split("-");
  return `${Number(endYear)}-${Number(endYear) + 1}`;
}

export default function NewQuinzaine() {
  const {
    publicData,
    quinzaineData,
    refetchQuinzaineData,
    refetchPrivateData,
  } = useData();
  const [maxKey, setMaxKey] = useState(0);
  const [autor, setAutor] = useState("");
  const [autorError, setAutorError] = useState(false);
  const [error, setError] = useState("");
  const [errorSeverity, setErrorSeverity] = useState<AlertColor | undefined>(
    "error"
  );
  const [loading, setLoading] = useState(false);

  const txtlenght1 = 15;

  function maxKeyFn() {
    const qnzData = quinzaineData?.get("15n");
    const maxKey = Math.max(
      ...Array.from(qnzData.keys(), (key) => Number(key))
    );
    setMaxKey(maxKey);
  }

  useEffect(() => {
    maxKeyFn();
  }, []);

  async function handleNew15n() {
    setLoading(true);
    // fetch private data from data provider. Wait for data
    // check that privateData.edition = maxedition, if not throw error
    // We have the data, we can writebatch
    // create new doc in private collection with the new data
    // in this doc create a collection "articles", copy into it each doc that was in the previous_quinzaine->articles collection. While copying dont copy the transactions field, set sales to 0, set new to false
    // copy the docs in public that have their edition field set to maxKey. And set their edition field to maxKey+1
    // set the new doc in public to active
    // set the other docs in public to inactive

    if (autor.length == 0 || autor.length > txtlenght1) {
      setErrorSeverity("error");
      setError("Error: Autor name is invalid");
      setLoading(false);
      return;
    }

    const Data = await refetchPrivateData(); //it get us private, 15n and public data. The "await" is necessary, dont listen to the editor, he is lying.
    if (!Data) {
      setError("Error fetching data");
      setErrorSeverity("error");
      setLoading(false);
      return;
    }
    const edition = Data.get("edition");
    if (edition !== maxKey) {
      // edge case, really should not happen
      setError(
        "Edition is not the last one: reload the page should fix it. Ne data was written"
      );
      setErrorSeverity("error");
      setLoading(false);
      return;
    }

    const articleCount = Data.get("articles").size;
    if (articleCount === 0) {
      setError("No articles found in the last quinzaine");
      setErrorSeverity("error");
      setLoading(false);
      return;
    }

    const originalMap = Data.get("articles");
    const arrayFromMap: any[] = Array.from(originalMap.entries());

    let chunks: Map<string, any>[] = [];
    for (let i = 0; i < arrayFromMap.length; i += 300) {
      chunks.push(new Map(arrayFromMap.slice(i, i + 300)));
    }
    console.log("chunks", chunks);

    try {
      for (let i = 0; i < chunks.length; i++) {
        const batch = writeBatch(db);
        const chunk: Map<string, any> = chunks[i];
        console.log("chunk", chunk);
        if (i === 0) {
          const newDocRef = doc(db, "private", String(edition + 1));
          setDoc(newDocRef, {
            edition: edition + 1,
            autor: autor,
            year: nextYear(Data.get("15n").get(String(edition)).year),
            transactions: {},
            creation_date: serverTimestamp(),
          });
          // public stuff
          // copy from public data, update the edition field
          // set all other docs to inactive in the public collection
        }
        for (const [key, value] of chunk.entries()) {
          let data: Record<string, any> = {}
          const docRef = doc(
            db,
            "private",
            String(edition + 1),
            "articles",
            key
          );
          // available
          data.available = value.available;
          // price in
          data.price_in = value.price_in;
          // stock
          data.stock = value.stock;
          data.new = false;
          data.sales = 0;
          data.transactions = {};
          batch.set(docRef, data);
        }
        await batch.commit();
        setError("Success: Quinzaine updated");
        setErrorSeverity("success");
        setLoading(false);
        refetchQuinzaineData();
        refetchPrivateData();
      }
    } catch (error) {
      setError("Error updating documents: " + error);
      setErrorSeverity("error");
      setLoading(false);
    }

    //await new Promise((resolve) => setTimeout(resolve, 6000));

    setLoading(false);
    console.log("handleNew15n");
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
            Create {maxKey + 1}th quinzaine
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
                Update 15n
              </LoadingButton>
            </Grid>
          </Grid>
          {error && (
            <Alert sx={{ mt: 3 }} severity={errorSeverity}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </>
  );
}
