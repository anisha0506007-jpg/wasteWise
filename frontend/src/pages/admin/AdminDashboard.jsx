import { ShieldCheck } from 'lucide-react';

import PlaceholderPage from '../../components/common/PlaceholderPage.jsx';

function AdminDashboard() {
  return (
    <PlaceholderPage
      icon={ShieldCheck}
      title="Admin Dashboard"
      description="Platform administrators will manage users, listings, and reports here."
    />
  );
}

export default AdminDashboard;