import { Helmet } from "react-helmet-async";
import LoginView from "../sections/login/LoginView";

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
          <Helmet>
        <title> Quinzaine | Login </title>
      </Helmet>
      <LoginView />
    </>
  );
}
