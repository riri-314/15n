import Container from "@mui/material/Container";
import WipView from "../sections/error/WipView";
import { Helmet } from "react-helmet-async";

// ----------------------------------------------------------------------

export default function WipPage() {
  return (
    <>
      <Helmet>
        <title> Quinzaine | WIP </title>
      </Helmet>
      <Container>
        <WipView />
      </Container>
    </>
  );
}
