import { ArrowRight, Inbox, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Skeleton from '../common/Skeleton.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatDate, formatQuantity, getInitials, timeAgo } from '../../utils/format.js';
import BusinessCard from './BusinessCard.jsx';
import './RecentRequests.css';

const ROLE_LABELS = { ngo: 'NGO', individual: 'Individual', business: 'Business' };

function RecentRequests({ requests, loading, error, onRetry }) {
  let body;

  if (loading) {
    body = (
      <div className="bz-list" aria-busy="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} variant="row" className="recent-requests__skeleton" />
        ))}
      </div>
    );
  } else if (error) {
    body = (
      <EmptyState icon={TriangleAlert} tone="error" compact title="Could not load requests" text={error}>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </EmptyState>
    );
  } else if (!requests || requests.length === 0) {
    body = (
      <EmptyState
        icon={Inbox}
        title="No donation requests yet"
        text="When an NGO or individual requests one of your products, it will show up here."
      />
    );
  } else {
    body = (
      <ul className="bz-list">
        {requests.map((request) => (
          <li key={request.id} className="bz-row bz-row--wide">
            <span className="bz-avatar" aria-hidden="true">
              {getInitials(request.requesterName)}
            </span>

            <div className="bz-row__main">
              <p className="bz-row__name">{request.requesterName}</p>
              <p className="bz-row__sub">{ROLE_LABELS[request.requesterRole] || 'User'}</p>
            </div>

            <div className="bz-row__details">
              <div>
                <span className="bz-cell__label">Requested</span>
                <span className="bz-cell__value">{request.productName}</span>
                <span className="bz-cell__hint">
                  {formatQuantity(request.requestedQuantity, request.unit)}
                </span>
              </div>
              <div>
                <span className="bz-cell__label">Date</span>
                <span className="bz-cell__value">{formatDate(request.createdAt)}</span>
                <span className="bz-cell__hint">{timeAgo(request.createdAt)}</span>
              </div>
            </div>

            <div className="bz-row__end">
              <StatusBadge status={request.status} />
              <Link to={`/business/requests/${request.id}`} className="bz-link">
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <BusinessCard
      title="Recent Donation Requests"
      subtitle="The latest requests for your products"
      action={
        <Button to="/business/requests" variant="outline" size="sm" rightIcon={<ArrowRight size={16} aria-hidden="true" />}>
          View All Requests
        </Button>
      }
    >
      {body}
    </BusinessCard>
  );
}

export default RecentRequests;