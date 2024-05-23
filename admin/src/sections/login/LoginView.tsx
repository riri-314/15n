import { useEffect, useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import loginImage from "../../assets/15n_black.svg";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";

import { auth } from "../../firebase_config";
import Iconify from "../../components/iconify/Iconify";
import { useRouter } from "../../routes/UseRouter";
import { useAuth } from "../../providers/AuthProvider";

const Login: React.FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const user = useAuth();

  useEffect(() => {
    if (user) {
      // if the user accidentially navigates to the login page while already logged in, redirect them to the home page
      router.push("/");
    }
    document.body.style.padding = "0";
    return () => {
      document.body.style.padding = ""; // Reset padding when component unmounts
    };
  }, []);

  async function signIn() {
    try {
      setError("");
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: unknown) {
      setError("Error signing in");
    }
    setLoading(false);
  }

  const renderLoginForm = (
    <>
      <Stack spacing={3}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img src={loginImage} alt="Login" style={{ width: "25%" }} />
        </div>
        <TextField
          name="email"
          label="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          name="password"
          label="Password"
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
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={loading}
          onClick={() => signIn()}
          sx={{ borderRadius: 2 }}
        >
          Connection
        </LoadingButton>
      </Stack>
    </>
  );
  return (
    <Box>
      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 520,
            borderRadius: 8,
            boxShadow: 0,
            border: 1,
            borderColor: "divider",
          }}
        >
          {renderLoginForm}
          {error && (
            <Alert
              sx={{ mt: 3 }}
              severity="error"
              onClose={() => {
                setError("");
              }}
            >
              {error}
            </Alert>
          )}
        </Card>
      </Stack>
      <p style={{ marginTop: "10px", textAlign: "center", fontSize: "16px" }}>
        Maison des Sciences 2024 | Henri Pihet
      </p>
    </Box>
  );
};

export default Login;
