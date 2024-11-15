import Loading from "./pages/Loading";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { DataProvider } from "./providers/DataProvider";
import Router from "./routes/Sections";
import Login from "./sections/login/LoginView";

function App() {
  const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) {
      return <Loading />; // loading if no public data (listener?)
    }

    if (!user) {
      return <Login />;
    }

    return (
      // only load the data provider if the user is logged in
      <DataProvider>
        <Router />
      </DataProvider>
    );
  };

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
