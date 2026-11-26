import {
  Activity,
  CircleCheck,
  CircleX,
  Inbox,
  PackageCheck,
  PackagePlus,
  Pencil,
  TriangleAlert,
} from 'lucide-react';

import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Skeleton from '../common/Skeleton.jsx';
import { timeAgo } from '../../utils/format.js';
import BusinessCard from './BusinessCard.jsx';
import './ActivityList.css';

const ACTIVITY_ICONS = {
  product_listed: PackagePlus,
  product_updated: Pencil,
  request_received: Inbox,
  request_accepted: CircleCheck,
  request_rejected: CircleX,
  product_collected: PackageCheck,
};

function ActivityList({ activities, loading, error, onRetry }) {
  let body;

  if (loading) {
    body = (
      <div aria-busy="true" className="activity-list__skeletons">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="row" />
        ))}
      </div>
    );
  } else if (error) {
    body = (
      <EmptyState icon={TriangleAlert} tone="error" compact title="Could not load activity" text={error}>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </EmptyState>
    );
  } else if (!activities || activities.length === 0) {
    body = (
      <EmptyState
        icon={Activity}
        compact
        title="No activity yet"
        text="Listings, requests and pickups will be recorded here."
      />
    );
  } else {
    body = (
      <ul className="activity-list">
        {activities.map((item) => {
          const Icon = ACTIVITY_ICONS[item.type] || Activity;
          return (
            <li key={item.id} className="activity-list__item">
              <span className={`activity-list__icon activity-list__icon--${item.type}`}>
                <Icon size={16} aria-hidden="true" />
              </span>
              <div className="activity-list__text">
                <p>{item.message}</p>
                <time dateTime={item.createdAt}>{timeAgo(item.createdAt)}</time>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <BusinessCard title="Recent Activity" subtitle="What happened lately">
      {body}
    </BusinessCard>
  );
}

export default ActivityList;