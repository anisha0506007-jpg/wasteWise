import { Routes, Route, Navigate } from 'react-router-dom';
import { History, Inbox, Sparkles, TrendingUp } from 'lucide-react';

import MainLayout from '../components/layout/MainLayout.jsx';
import BusinessLayout from '../components/business/BusinessLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import GuestRoute from './GuestRoute.jsx';

import Landing from '../pages/public/Landing.jsx';
import ExploreDonations from '../pages/public/ExploreDonations.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import BusinessDashboard from '../pages/business/BusinessDashboard.jsx';
import BusinessProfile from '../pages/business/BusinessProfile.jsx';
import BusinessNotifications from '../pages/business/BusinessNotifications.jsx';
import BusinessPlaceholder from '../pages/business/BusinessPlaceholder.jsx';
import MyProducts from '../pages/business/MyProducts.jsx';
import AddProduct from '../pages/business/AddProduct.jsx';
import EditProduct from '../pages/business/EditProduct.jsx';
import ProductDetails from '../pages/business/ProductDetails.jsx';
import NgoDashboard from '../pages/ngo/NgoDashboard.jsx';
import IndividualDashboard from '../pages/individual/IndividualDashboard.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import TestConnection from '../pages/TestConnection.jsx';
import NotFound from '../pages/NotFound.jsx';

function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Business area: own layout (sidebar + header), business role only ---------- */}
      <Route element={<ProtectedRoute allowedRoles={['business']} />}>
        <Route path="/business" element={<BusinessLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BusinessDashboard />} />
          <Route path="profile" element={<BusinessProfile />} />
          <Route path="notifications" element={<BusinessNotifications />} />

          {/* Product management (Phase 5) */}
          <Route path="products" element={<MyProducts />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="products/:productId" element={<ProductDetails />} />
          <Route path="products/:productId/edit" element={<EditProduct />} />

          {/* Built in later phases. Placeholders keep every link working. */}
          <Route
            path="requests"
            element={
              <BusinessPlaceholder
                icon={Inbox}
                title="Donation Requests"
                description="Review, accept or decline requests from NGOs and individuals."
              />
            }
          />
          <Route
            path="requests/:requestId"
            element={
              <BusinessPlaceholder
                icon={Inbox}
                title="Request details"
                description="See the full details of a donation request."
              />
            }
          />
          <Route
            path="history"
            element={
              <BusinessPlaceholder
                icon={History}
                title="Donation History"
                description="A complete record of every donation you have completed."
              />
            }
          />
          <Route
            path="analytics"
            element={
              <BusinessPlaceholder
                icon={TrendingUp}
                title="Analytics"
                description="Detailed reports about your waste reduction impact over time."
              />
            }
          />
          <Route
            path="ai-assistant"
            element={
              <BusinessPlaceholder
                icon={Sparkles}
                title="AI Waste Assistant"
                description="Smart suggestions to predict and reduce surplus. Not available yet."
              />
            }
          />
        </Route>
      </Route>

      {/* ---------- Website pages (Navbar + Footer) ---------- */}
      <Route element={<MainLayout />}>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<ExploreDonations />} />

        {/* Only for logged-out users (logged-in users are sent to their dashboard) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Password recovery (open to everyone) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Other dashboards: still placeholders, each locked to one role */}
        <Route element={<ProtectedRoute allowedRoles={['ngo']} />}>
          <Route path="/ngo/dashboard" element={<NgoDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['individual']} />}>
          <Route path="/individual/dashboard" element={<IndividualDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Phase 1 connectivity test */}
        <Route path="/test-connection" element={<TestConnection />} />

        {/* Any other URL */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;