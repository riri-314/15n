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
import SelectCustom from "../../components/input/Select";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase_config";
import { useData } from "../../providers/DataProvider";

function generateOptions(year: string) {
  const [startYear, endYear] = year.split("-");

  const a = `${Number(startYear) - 3}-${Number(startYear) - 2}`;
  const b = `${Number(startYear) - 2}-${Number(startYear) - 1}`;
  const c = `${Number(startYear) - 1}-${Number(startYear)}`;
  const d = `${endYear}-${Number(endYear) + 1}`;
  const e = `${Number(endYear) + 1}-${Number(endYear) + 2}`;
  const f = `${Number(endYear) + 2}-${Number(endYear) + 3}`;

  return {
    [a]: 1,
    [b]: 2,
    [c]: 3,
    [year]: 4,
    [d]: 5,
    [e]: 6,
    [f]: 7,
  };
}

interface Edit15nProps {
  data: any;
  close: () => void;
}

export default function QuinzaineEdit({ data, close }: Edit15nProps) {
  const { refetchQuinzaineData } = useData();
  const [author, setAuthor] = useState(data.author);
  const [authorError, setAuthorError] = useState(false);
  const [year, setYear] = useState(data.year);
  const [error, setError] = useState("");
  const [errorSeverity, setErrorSeverity] = useState<AlertColor | undefined>(
    "error"
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  async function handleEdit15n() {
    setLoading(true);
    setError("");
    setErrorSeverity("error");
    setSuccess(false);
    if (author.length == 0 || author.length > txtlenght1) {
      setErrorSeverity("error");
      setError("Erreur: Nom de l'auteur invalide");
      setLoading(false);
      return;
    } else if (year.length == 0 || year.length > 9) {
      setErrorSeverity("error");
      setError("Erreur: Année invalide");
      setLoading(false);
      return;
    } else {
      // update the quinzaine
      try {
        const quinzaineRef = doc(db, "Quinzaines", String(data.id));
        const quinzaineData = {
          author: author,
          year: year,
        };
        await setDoc(quinzaineRef, quinzaineData, { merge: true });
        await refetchQuinzaineData();
        setErrorSeverity("success");
        setError("Succès: Quinzaine mise à jour avec succès");
        setSuccess(true);
        setLoading(false);
        return;
      } catch (error) {
        setErrorSeverity("error");
        setError("Erreur: erreur lors de la mise à jour de la quinzaine");
        setLoading(false);
        return;
      }
    }
  }

  return (
    <>
      <Card sx={{ width: "90%", mb: 4, ml: "auto", mr: "auto" }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Editer {data.id}éme quinzaine
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
              disabled={success}
                error={authorError}
                label="Auteur"
                value={author}
                fullWidth
                onChange={(e) => {
                  let value = e.target.value;
                  if (value.length <= txtlenght1) {
                    setAuthor(value);
                  }
                  if (value.length == 0) {
                    setAuthorError(true);
                  } else {
                    setAuthorError(false);
                  }
                }}
              />
              <FormHelperText>
                Nom du chef 15n. Max {txtlenght1} character. {author.length}
                /{txtlenght1}
              </FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ zIndex: 9999 }}>
              <SelectCustom
              disabled={success}
                option={generateOptions(data.year)}
                change={(_event: any, val: any) => {
                  console.log("val", val);
                  setYear(val);
                }}
                defaultValue={data.year}
                isError={false}
                helpText="Choisir l'année académique de la quinzaine"
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <LoadingButton
                size="large"
                variant="contained"
                fullWidth
                onClick={close}
                color="error"
                style={{ zIndex: 0 }}
              >
                {success ? "Fermer" : "Annuler"}
              </LoadingButton>
            </Grid>
            {!success && (
              <Grid item xs={12} sm={12}>
                <LoadingButton
                  size="large"
                  variant="contained"
                  fullWidth
                  onClick={handleEdit15n}
                  loading={loading}
                >
                  Mettre à jour
                </LoadingButton>
              </Grid>
            )}
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
