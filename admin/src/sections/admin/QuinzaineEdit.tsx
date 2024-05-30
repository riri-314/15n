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
  const { refetchPrivateData } = useData();
  const [autor, setAutor] = useState(data.autor);
  const [autorError, setAutorError] = useState(false);
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
    if (autor.length == 0 || autor.length > txtlenght1) {
      setErrorSeverity("error");
      setError("Error: Autor name is invalid");
      setLoading(false);
      return;
    } else if (year.length == 0 || year.length > 9) {
      setErrorSeverity("error");
      setError("Error: Year is invalid");
      setLoading(false);
      return;
    } else {
      // update the quinzaine
      try {
        const quinzaineRef = doc(db, "Private", String(data.id));
        const quinzaineData = {
          autor: autor,
          year: year,
        };
        await setDoc(quinzaineRef, quinzaineData, { merge: true });
        setErrorSeverity("success");
        setError("Success: Quinzaine updated");
        setSuccess(true);
        setLoading(false);
        refetchPrivateData();

        return;
      } catch (error) {
        setErrorSeverity("error");
        setError("Error: Failed to update the quinzaine");
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
            Edit {data.id}th quinzaine
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
            <Grid item xs={12} sm={6} sx={{ zIndex: 9999 }}>
              <SelectCustom
                option={generateOptions(data.year)}
                change={(_event: any, val: any) => {
                  console.log("val", val);
                  setYear(val);
                }}
                defaultValue={data.year}
                isError={false}
                helpText="Select the academic year of the quinzaine"
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
                {success ? "Close" : "Cancel"}
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
                  Update 15n
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
