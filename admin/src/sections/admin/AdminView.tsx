import Refresh from "../../components/refresh/Refresh";
import QuinzainesTable from "./QuinzainesTable";

export default function AdminView() {
  return (
    <>
      <Refresh />
      <div style={{ paddingTop: "1.5rem" }}>
        <QuinzainesTable />
      </div>
    </>
  );
}
