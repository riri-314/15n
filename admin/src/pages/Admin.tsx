import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";
import { useEffect } from "react";
import AdminView from "../sections/admin/AdminView";

// --------------------------------------
export default function AdminPage() {
  const { privateData, loading, refetchPrivateData } = useData();

  //load doc from firebase then display account
  useEffect(() => {
    //console.log("StatsPage useEffect: ", privateData, loading);
    if (!privateData && !loading) {
      refetchPrivateData();
    }
  }, []);

  return (
    <div style={{width:"100%"}}>
        {privateData ? <AdminView /> : <Loading />}
    </div>
  );
}
