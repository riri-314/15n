import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";
import { useEffect, useState } from "react";
import AdminView from "../sections/admin/AdminView";

// --------------------------------------
export default function AdminPage() {
  const { quinzaineData, refetchQuinzaineData } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await refetchQuinzaineData();
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {quinzaineData && !loading ? <AdminView /> : <Loading />}
    </div>
  );
}
