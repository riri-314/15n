import { lazy, Suspense } from "react";
import { Outlet, Navigate, useRoutes } from "react-router-dom";

import LoginPage from "../pages/Login.tsx";
import NavBar from "../sections/navbar/NavBar.tsx";
import LoadingPage from "../pages/Loading.tsx";

export const AdminPage = lazy(() => import("../pages/Admin.tsx"));
export const AdminLoginPage = lazy(() => import("../pages/AdminLogin.tsx"));
export const NotFoundPage = lazy(() => import("../pages/NotFound.tsx"));
export const WipPage = lazy(() => import("../pages/WorkInProgress.tsx"));
export const StatsPage = lazy(() => import("../pages/Stats.tsx"));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <NavBar>
          <Suspense fallback={<LoadingPage />}>
            <Outlet />
          </Suspense>
        </NavBar>
      ),
      children: [
        { element: <WipPage />, index: true }, //scanner
        {
          path: "stats",
          element: (
            <AdminLoginPage key="stats">
              <StatsPage />
            </AdminLoginPage>
          ),
        },
        {
          path: "carte",
          element: (
            <AdminLoginPage key="carte">
              <StatsPage />
            </AdminLoginPage>
          ),
        },
        {
          path: "stock",
          element: (
            <AdminLoginPage key="stock">
              <StatsPage />
            </AdminLoginPage>
          ),
        },
        {
          path: "admin",
          element: (
            <AdminLoginPage key="admin">
              <AdminPage />
            </AdminLoginPage>
          ),
        },
      ],
    },
    // pages without NavBar
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "404",
      element: <NotFoundPage />,
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
