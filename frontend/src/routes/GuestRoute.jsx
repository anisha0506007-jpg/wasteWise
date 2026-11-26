import { Navigate, Outlet, useLocation } from 'react-router-dom';

import Loader from '../components/common/Loader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { canAccessPath, getDashboardPath } from '../utils/roles.js';

function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen label="Loading..." />;

  if (user) {
    const requestedPath = location.state?.from?.pathname;
    const target =
      requestedPath && canAccessPath(user.role, requestedPath)
        ? requestedPath
        : getDashboardPath(user.role);
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;