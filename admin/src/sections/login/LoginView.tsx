import { useState } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";

import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase_config";
import { useRouter } from "../../routes/UseRouter";
import Iconify from "../../components/iconify/iconify";

// ----------------------------------------------------------------------

export default function LoginView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotPassword, setForgotPassword] = useState(false);

  // ...

  const handleToggleForgotPassword = () => {
    setForgotPassword(!forgotPassword);
    setError("");
  };

  const handleForgottenPassword = async () => {
    if (email == "") {
      setError("Entrez une adresse mail pour changer votre mot de passe");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      setError("Un email vous a été envoyé");
    } catch (error: any) {
      console.log("Error: ", error?.code);
      if (error?.code == "auth/too-many-requests") {
        setError("Trop d'essais, essayer plus tard");
      } else if (error?.code == "auth/invalid-credential") {
        setError("Mauvais mot de passe ou email");
      } else {
        setError("Erreur de connection");
      }
      setLoading(false);
    }
  };

  const handleClick = async () => {
    // check login
    // do what need to be done
    if (email == "" || password == "") {
      setError("Entrez un mot de passe ou une adresse mail");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      router.push("/");
    } catch (error: any) {
      console.log("Error: ", error?.code);
      if (error?.code == "auth/too-many-requests") {
        setError("Trop d'essais, essayer plus tard");
      } else if (error?.code == "auth/invalid-credential") {
        setError("Mauvais mot de passe ou email");
      } else {
        setError("Erreur de connection");
      }
      setLoading(false);
    }
  };

  const renderLoginForm = (
    <>
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          name="password"
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  <Iconify
                    icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ my: 3 }}
      >
        <Link
          variant="subtitle2"
          underline="hover"
          onClick={handleToggleForgotPassword}
        >
          Mot de passe oublié?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
        onClick={handleClick}
      >
        Connexion
      </LoadingButton>
    </>
  );

  const renderForgotPassword = (
    <>
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          sx={{ my: 3 }}
        >
          <Link
            variant="subtitle2"
            underline="hover"
            onClick={handleToggleForgotPassword}
          >
            Connecte-toi
          </Link>
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          color="inherit"
          loading={loading}
          onClick={handleForgottenPassword}
        >
          Réniitialiser le mot de passe
        </LoadingButton>
      </Stack>
    </>
  );

  const renderForm = forgotPassword ? renderForgotPassword : renderLoginForm;

  return (
    <Box>
      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography sx={{ pb: 3 }} variant="h4">
            Connecte-toi
          </Typography>
          {error && (
            <Alert sx={{ mb: 3 }} severity="error">
              {error}
            </Alert>
          )}
          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
