import { Search } from 'lucide-react';

import PlaceholderPage from '../../components/common/PlaceholderPage.jsx';
import Button from '../../components/common/Button.jsx';

function ExploreDonations() {
  return (
    <PlaceholderPage
      icon={Search}
      badge="Coming soon"
      title="Explore Available Food"
      description="Browse surplus food donations from nearby businesses. Listings will appear here once the donation features are built."
    >
      <Button to="/">Back to Home</Button>
      <Button to="/register" variant="outline">
        Create an Account
      </Button>
    </PlaceholderPage>
  );
}

export default ExploreDonations;