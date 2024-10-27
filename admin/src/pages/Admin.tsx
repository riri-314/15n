import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";
import { useEffect, useState } from "react";
import AdminView from "../sections/admin/AdminView";

// --------------------------------------
export default function AdminPage() {
  const { quinzaineData, refetchQuinzaineData } = useData();
  const [loading, setLoading] = useState(true);

  function loadComponent() {
    //console.log("loadComponent");
    if (quinzaineData != null) {
      if (loading) {
        return <Loading text="Chargement en cours..." />;
      } else {
        return <AdminView />;
      }
    } else {
      if (loading) {
        return <Loading text="Chargement en cours..." />;
      } else {
        return <Loading text="Erreur lors du chargement des données." />;
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await refetchQuinzaineData();
      setLoading(false);
    };
    fetchData();
  }, []);

  return <div style={{ width: "100%" }}>{loadComponent()}</div>;
}
//       {quinzaineData && !loading ? <AdminView /> : <Loading />}
