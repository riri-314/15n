import Container from "@mui/material/Container";
import { useData } from "../providers/DataProvider";
import Loading from "../sections/loading/Loading";

// --------------------------------------
export default function StatsPage() {
  const { data } = useData();

  //load doc from firebase then display account
  return (
    <>
      <Container maxWidth="xl">{data ? <>Youhou</> : <Loading />}</Container>
    </>
  );
}
