import { Compass } from 'lucide-react';

import PlaceholderPage from '../components/common/PlaceholderPage.jsx';
import Button from '../components/common/Button.jsx';

function NotFound() {
  return (
    <PlaceholderPage
      icon={Compass}
      badge="Error 404"
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
    >
      <Button to="/">Go Back Home</Button>
    </PlaceholderPage>
  );
}

export default NotFound;