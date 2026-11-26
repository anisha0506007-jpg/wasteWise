import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye, MapPin, Package, Pencil, Trash2 } from 'lucide-react';

import SmartImage from '../common/SmartImage.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatDate, formatQuantity } from '../../utils/format.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { formatDateTime, formatPickupWindow } from '../../utils/productFormat.js';
import ExpiryBadge from './ExpiryBadge.jsx';
import './ProductCard.css';

// Props: product (from the API), onDelete(product)
function ProductCard({ product, onDelete }) {
  const detailsPath = `/business/products/${product.id}`;
  const percentLeft =
    product.totalQuantity > 0
      ? Math.min(Math.round((product.availableQuantity / product.totalQuantity) * 100), 100)
      : 0;

  return (
    <article className="pcard">
      <Link to={detailsPath} className="pcard__media" aria-label={`View ${product.name}`}>
        {product.image ? (
          <SmartImage className="pcard__image" src={getImageUrl(product.image)} alt={product.name} fallbackIcon={Package} />
        ) : (
          <span className="pcard__image pcard__image--empty">
            <Package size={40} aria-hidden="true" />
          </span>
        )}
        <span className="pcard__status">
          <StatusBadge status={product.status} />
        </span>
      </Link>

      <div className="pcard__body">
        <p className="pcard__category">{product.category}</p>
        <h3 className="pcard__name">
          <Link to={detailsPath}>{product.name}</Link>
        </h3>

        <div className="pcard__stock">
          <div className="pcard__stock-text">
            <span>
              <strong>{formatQuantity(product.availableQuantity, product.unit)}</strong> available
            </span>
            <span>of {formatQuantity(product.totalQuantity, product.unit)}</span>
          </div>
          <div className="pcard__bar" aria-hidden="true">
            <span style={{ width: `${percentLeft}%` }} />
          </div>
        </div>

        <ul className="pcard__meta">
          <li>
            <Calendar size={15} aria-hidden="true" />
            <span>Expires {formatDateTime(product.expiryDate)}</span>
          </li>
          <li>
            <Clock size={15} aria-hidden="true" />
            <span>{formatPickupWindow(product.pickupStartTime, product.pickupEndTime)}</span>
          </li>
          <li>
            <MapPin size={15} aria-hidden="true" />
            <span>{product.city}</span>
          </li>
        </ul>

        <ExpiryBadge level={product.expiryLevel} status={product.status} />
        <p className="pcard__created">Listed {formatDate(product.createdAt)}</p>
      </div>

      <div className="pcard__actions">
        <Link to={detailsPath} className="pcard__action">
          <Eye size={16} aria-hidden="true" /> View
        </Link>
        <Link to={`${detailsPath}/edit`} className="pcard__action">
          <Pencil size={16} aria-hidden="true" /> Edit
        </Link>
        <button
          type="button"
          className="pcard__action pcard__action--danger"
          onClick={() => onDelete(product)}
        >
          <Trash2 size={16} aria-hidden="true" /> Delete
        </button>
      </div>
    </article>
  );
}

export default ProductCard;