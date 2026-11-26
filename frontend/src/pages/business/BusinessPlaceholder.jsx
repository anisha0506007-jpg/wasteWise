import { useSearchParams } from 'react-router-dom';

import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import BusinessCard from '../../components/business/BusinessCard.jsx';
import './BusinessPlaceholder.css';

function BusinessPlaceholder({ icon, title, description }) {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search');

  return (
    <div className="bz-placeholder">
      <BusinessCard>
        <EmptyState icon={icon} title={title} text={description}>
          <span className="bz-placeholder__badge">Coming in the next phase</span>
          {searchTerm && (
            <p className="bz-placeholder__search">
              Your search for &ldquo;{searchTerm}&rdquo; will filter your products here once this page is built.
            </p>
          )}
          <Button to="/business/dashboard" variant="outline">
            Back to Overview
          </Button>
        </EmptyState>
      </BusinessCard>
    </div>
  );
}

export default BusinessPlaceholder;