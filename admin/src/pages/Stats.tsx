import Container from "@mui/material/Container";
import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

// --------------------------------------
export default function StatsPage() {
  const { privateData, loadingPrivate, refetchPrivateData } = useData();

  function loadComponent() {
    //console.log("loadComponent");
    if (privateData != null) {
      if (loadingPrivate) {
        return <Loading text="Chargement en cours..." />;
      } else {
        return <div>Data loaded successfully!</div>;
      }
    } else {
      if (loadingPrivate) {
        return <Loading text="Chargement en cours..." />;
      } else {
        return <Loading text="Erreur lors du chargement des données." />;
      }
    }
  }

  //load doc from firebase then display account
  useEffect(() => {
    //console.log("StatsPage useEffect: ", privateData, loading);
    if (privateData == null && !loadingPrivate) {
      refetchPrivateData();
    }
  }, []);

  return (
    <>
      <Helmet>
        <title> Quinzaine | Stats </title>
      </Helmet>
      <Container maxWidth="xl">{loadComponent()}</Container>
    </>
  );
}
