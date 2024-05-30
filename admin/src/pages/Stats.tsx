import Container from "@mui/material/Container";
import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";
import { useEffect } from "react";

// --------------------------------------
export default function StatsPage() {
  const { privateData, loadingPrivate, refetchPrivateData } =
    useData();

  //load doc from firebase then display account
  useEffect(() => {
    //console.log("StatsPage useEffect: ", privateData, loading);
    if (!privateData && !loadingPrivate) {
      refetchPrivateData();
    }
  }, []);

  return (
    <>
      <Container maxWidth="xl">
        {privateData ? (
          <>
            Youhou
          </>
        ) : (
          <Loading />
        )}
      </Container>
    </>
  );
}
