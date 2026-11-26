import { Leaf } from 'lucide-react';

import PlaceholderPage from '../components/common/PlaceholderPage.jsx';
import Button from '../components/common/Button.jsx';

function Home() {
  return (
    <PlaceholderPage
      icon={Leaf}
      badge="Phase 2 · Foundation"
      title="Welcome to WasteWise"
      description="The landing page content will be built in the next phase. The layout, navigation, and design system are ready."
    >
      <Button to="/register">Get Started</Button>
      <Button to="/test-connection" variant="outline">
        Test Connection
      </Button>
    </PlaceholderPage>
  );
}

export default Home;