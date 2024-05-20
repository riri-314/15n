import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import WipPage from '../pages/WorkInProgress.tsx';
import LoginPage from '../pages/login.tsx';
import NavBar from '../sections/navbar/NavBar.tsx';

export const NotFoundPage = lazy(() => import('../pages/NotFound.tsx'));
export const StatsPage = lazy(() => import('../pages/Stats.tsx'));

// ----------------------------------------------------------------------

export default function Router() {


  const routes = useRoutes([
    {
      element: (
        <NavBar>
          <Suspense>
            <Outlet />
          </Suspense>
        </NavBar>
      ),
      children: [
        { element: <WipPage />, index: true },
        { path: 'stats', element: <StatsPage /> },
        { path: 'rules', element: <StatsPage /> }
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <NotFoundPage />,
    },
      {
      path: 'wip',
      element: <WipPage />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
