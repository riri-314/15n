import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";
import { Helmet } from "react-helmet-async";
import ScannerView from "../sections/scanner/ScannerView";
import { useState } from "react";

export default function Scanner() {
  const { publicDataListener, loadingPublicListener } = useData();


  if (loadingPublicListener) {
    return (
      <>
        <Helmet>
          <title>Quinzaine | Scanner</title>
        </Helmet>
        <Loading />
      </>
    );
  }

  if (!loadingPublicListener && publicDataListener) {
    return (
      <>
        <Helmet>
          <title>Quinzaine | Scanner</title>
        </Helmet>
        <ScannerView unSend={0}/>

      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Quinzaine | Scanner</title>
      </Helmet>
      {/* Optionally, render a fallback UI here */}
    </>
  );
}
