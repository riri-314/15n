import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";
import { useEffect } from "react";
import AdminView from "../sections/admin/AdminView";

// --------------------------------------
export default function AdminPage() {
  const { quinzaineData, loadingQuinzaine, refetchQuinzaineData } = useData();

  //load doc from firebase then display account
  useEffect(() => {
    //console.log("StatsPage useEffect: ", privateData, loading);
    if (!quinzaineData && !loadingQuinzaine) {
      refetchQuinzaineData();
    }
  }, []);

  return (
    <div style={{width:"100%"}}>
        {quinzaineData ? <AdminView /> : <Loading />}
    </div>
  );
}
