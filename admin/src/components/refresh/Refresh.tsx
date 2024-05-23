import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import Iconify from "../iconify/Iconify";
import { useData } from "../../providers/DataProvider";
import { useEffect, useState } from "react";

export default function Refresh() {
  const { privateData, fetchedTime, loading, refetchPrivateData } = useData();
  const [refreshTime, setRefreshTime] = useState("");

  function formatTime(time: number): string {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Update the fetchedTime every second
      setRefreshTime(formatTime(Date.now() - fetchedTime));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchedTime]);

  return (
    <Container>
      {privateData && fetchedTime && !loading ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontStyle: "oblique",
              m: -1,
            }}
            onClick={refetchPrivateData}
          >
            <Typography variant="body1" sx={{ marginLeft: "5px" }}>
              Updated {refreshTime} ago.
            </Typography>
            <Iconify icon="material-symbols-light:refresh" />
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontStyle: "oblique",
              m: -1,
            }}
          >
            <Typography variant="body1" sx={{ marginLeft: "5px" }}>
              Updating...
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
}
