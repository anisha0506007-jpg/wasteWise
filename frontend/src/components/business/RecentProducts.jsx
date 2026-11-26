import { ArrowRight, Package, PackagePlus, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Skeleton from '../common/Skeleton.jsx';
import SmartImage from '../common/SmartImage.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { describeExpiry, formatDate, formatQuantity } from '../../utils/format.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import BusinessCard from './BusinessCard.jsx';
import './RecentProducts.css';

// Show "Expires Today" / "Expiring Soon" instead of plain "Available" when it applies
const getBadgeStatus = (product) =>
  product.displayStatus === 'available' &&
  (product.expiryStatus === 'expires_today' || product.expiryStatus === 'expiring_soon')
    ? product.expiryStatus
    : product.displayStatus;

function RecentProducts({ products, loading, error, onRetry }) {
  let body;

  if (loading) {
    body = (
      <div className="bz-list" aria-busy="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} variant="row" className="recent-products__skeleton" />
        ))}
      </div>
    );
  } else if (error) {
    body = (
      <EmptyState icon={TriangleAlert} tone="error" compact title="Could not load products" text={error}>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </EmptyState>
    );
  } else if (!products || products.length === 0) {
    body = (
      <EmptyState icon={Package} title="No products listed yet" text="Add your first surplus product and NGOs nearby will be able to request it.">
        <Button to="/business/products/new" leftIcon={<PackagePlus size={18} />}>
          Add Surplus Product
        </Button>
      </EmptyState>
    );
  } else {
    body = (
      <ul className="bz-list">
        {products.map((product) => (
          <li key={product.id} className="bz-row bz-row--wide">
            {product.image ? (
              <SmartImage className="bz-thumb" src={getImageUrl(product.image)} alt={product.name} fallbackIcon={Package} />
            ) : (
              <span className="bz-thumb">
                <Package size={22} aria-hidden="true" />
              </span>
            )}

            <div className="bz-row__main">
              <p className="bz-row__name">{product.name}</p>
              <p className="bz-row__sub">{product.category}</p>
            </div>

            <div className="bz-row__details">
              <div>
                <span className="bz-cell__label">Quantity</span>
                <span className="bz-cell__value">{formatQuantity(product.quantity, product.unit)}</span>
                <span className="bz-cell__hint">
                  {formatQuantity(product.remainingQuantity, product.unit)} remaining
                </span>
              </div>
              <div>
                <span className="bz-cell__label">Expiry</span>
                <span className="bz-cell__value">{formatDate(product.expiryDate)}</span>
                <span className="bz-cell__hint">{describeExpiry(product.expiryDate)}</span>
              </div>
            </div>

            <div className="bz-row__end">
              <StatusBadge status={getBadgeStatus(product)} />
              <Link to={`/business/products/${product.id}`} className="bz-link">
                View / Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <BusinessCard
      title="Recent Products"
      subtitle="Your latest five listings"
      action={
        <Button to="/business/products" variant="outline" size="sm" rightIcon={<ArrowRight size={16} aria-hidden="true" />}>
          View All Products
        </Button>
      }
    >
      {body}
    </BusinessCard>
  );
}

export default RecentProducts;