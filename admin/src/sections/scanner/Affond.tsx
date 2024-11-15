import { Alert, keyframes, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";

const flashAnimation = keyframes`
  0% { background-color: #ff00ff; }
  50% { background-color: #00ffff; }
  100% { background-color: #ff00ff; }
`;

export default function AffondQuinzaine() {
  const [show, setShow] = useState(false);

  //set to true to show the alert every hour from xx:55 to xx:05
  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      if (date.getMinutes() >= 55 || date.getMinutes() <= 5) {
        setShow(true);
      } else {
        setShow(false);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    show && ( // Show the Snackbar only when show is true
      <Snackbar
        sx={{
          maxWidth: "500px", // Increase the max width of Snackbar
          padding: "1rem", // Add padding
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={true}
        message="I love snacks"
      >
        <Alert
          onClose={() => {}}
          severity="warning"
          sx={{
            width: "100%",
            fontSize: "2rem", // Increase the font size further
            padding: "2rem", // Add padding for a bigger look
            textAlign: "center", // Center text
            animation: `${flashAnimation} 1s infinite`, // Add flashing animation
          }}
        >
          🎉 Affond 15n! 🎉
        </Alert>
      </Snackbar>
    )
  );
}
