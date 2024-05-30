import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";
import { useEffect, useState } from "react";
import AdminView from "../sections/admin/AdminView";

// --------------------------------------
export default function AdminPage() {
  const { privateData, refetchPrivateData } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await refetchPrivateData();
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {privateData && !loading ? <AdminView /> : <Loading />}
    </div>
  );
}
