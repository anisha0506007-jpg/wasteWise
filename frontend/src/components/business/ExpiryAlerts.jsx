import { CircleCheck, Clock, Lock, Package, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Skeleton from '../common/Skeleton.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { describeExpiry, formatQuantity } from '../../utils/format.js';
import BusinessCard from './BusinessCard.jsx';
import './ExpiryAlerts.css';

function ExpiryAlerts({ data, loading, error, onRetry }) {
  let body;

  if (loading) {
    body = (
      <div aria-busy="true">
        <Skeleton variant="row" className="expiry-alerts__skeleton" />
        <Skeleton variant="row" className="expiry-alerts__skeleton" />
        <Skeleton variant="row" />
      </div>
    );
  } else if (error) {
    body = (
      <EmptyState icon={TriangleAlert} tone="error" compact title="Could not load alerts" text={error}>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </EmptyState>
    );
  } else if (!data || data.alerts.length === 0) {
    body = (
      <EmptyState
        icon={CircleCheck}
        compact
        title="Nothing is close to expiry"
        text="Great! None of your products in stock are expiring soon."
      />
    );
  } else {
    const { summary, alerts } = data;
    body = (
      <>
        <ul className="expiry-alerts__summary">
          <li className="expiry-alerts__chip expiry-alerts__chip--red">{summary.expired} expired</li>
          <li className="expiry-alerts__chip expiry-alerts__chip--solid">{summary.expiresToday} today</li>
          <li className="expiry-alerts__chip expiry-alerts__chip--orange">{summary.expiringSoon} soon</li>
        </ul>

        <ul className="bz-list">
          {alerts.map((product) => {
            const status = product.expiryStatus;
            return (
              <li key={product.id} className="bz-row">
                <span className={`expiry-alerts__icon expiry-alerts__icon--${status}`}>
                  {status === 'expired' ? (
                    <TriangleAlert size={20} aria-hidden="true" />
                  ) : (
                    <Clock size={20} aria-hidden="true" />
                  )}
                </span>

                <div className="bz-row__main">
                  <p className="bz-row__name">{product.name}</p>
                  <p className="bz-row__sub">
                    {formatQuantity(product.remainingQuantity, product.unit)} left
                  </p>
                </div>

                <div className="bz-row__details">
                  <div>
                    <span className="bz-cell__label">Expiry</span>
                    <span className="bz-cell__value">{describeExpiry(product.expiryDate)}</span>
                  </div>
                  {status === 'expired' && (
                    <span className="expiry-alerts__blocked">
                      <Lock size={14} aria-hidden="true" /> Cannot be donated
                    </span>
                  )}
                </div>

                <div className="bz-row__end">
                  <StatusBadge status={status} />
                  <Link to={`/business/products/${product.id}`} className="bz-link">
                    Manage
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        {data.pagination.total > alerts.length && (
          <p className="expiry-alerts__more">
            <Package size={14} aria-hidden="true" /> Showing {alerts.length} of {data.pagination.total} alerts.
          </p>
        )}
      </>
    );
  }

  return (
    <BusinessCard title="Expiry Alerts" subtitle="Products that need attention">
      {body}
    </BusinessCard>
  );
}

export default ExpiryAlerts;