import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";
import { useEffect } from "react";
import AdminView from "../sections/admin/AdminView";

// --------------------------------------
export default function AdminPage() {
  const { quinzaineData, refetchQuinzaineData, loadingQuinzaine } = useData();

  // make sure that the data is fetched before rendering the page
  useEffect(() => {
    //console.log("StatsPage useEffect: ", privateData, loading);
    refetchQuinzaineData();
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {quinzaineData && !loadingQuinzaine ? <AdminView /> : <Loading />}
    </div>
  );
}
