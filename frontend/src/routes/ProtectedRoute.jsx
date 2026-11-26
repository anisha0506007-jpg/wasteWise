import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import Loader from '../components/common/Loader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { getDashboardPath } from '../utils/roles.js';

// Sends the user to their own dashboard and explains why
function AccessDeniedRedirect({ to }) {
  const toast = useToast();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return; // avoids a double toast in React StrictMode
    shown.current = true;
    toast.error("You don't have permission to view that page.");
  }, [toast]);

  return <Navigate to={to} replace />;
}

/**
 * Usage in AppRoutes:
 *   <Route element={<ProtectedRoute allowedRoles={['business']} />}>
 *     <Route path="/business/dashboard" element={<BusinessDashboard />} />
 *   </Route>
 */
function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until we know whether the person is logged in (prevents a flash of "logged out")
  if (loading) return <Loader fullScreen label="Checking your session..." />;

  // Not logged in: go to login and remember where they wanted to go
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDeniedRedirect to={getDashboardPath(user.role)} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;