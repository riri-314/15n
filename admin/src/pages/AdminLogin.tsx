import Container from "@mui/material/Container";
import { useState } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Iconify from "../components/iconify/iconify";
import { Typography } from "@mui/material";

interface adminLoginProps {
  children: React.ReactNode;
}

export default function AdminLoginPage({ children }: adminLoginProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  function signIn() {
    setError("");
    setLoading(true);
    if (password === "obqd") {
      setAdmin(true);
      setLoading(false);
    } else {
      setError("Error signing in");
      setLoading(false);
    }
  }

  const renderLoginForm = (
    <>
      <Stack spacing={3}>
        <Typography variant="h4" align="center"><b>Admin Login</b></Typography>
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
    <>
      {admin ? (
        children
      ) : (
        <Container maxWidth="xl">
          <Box>
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ height: 1 }}
            >
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
          </Box>
        </Container>
      )}
    </>
  );
}
