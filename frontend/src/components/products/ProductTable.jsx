import { Link } from 'react-router-dom';
import { Eye, Package, Pencil, Trash2 } from 'lucide-react';

import SmartImage from '../common/SmartImage.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatDate, formatQuantity } from '../../utils/format.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { formatDateTime, formatPickupWindow } from '../../utils/productFormat.js';
import ExpiryBadge from './ExpiryBadge.jsx';
import './ProductTable.css';

// Props: products, onDelete(product)
function ProductTable({ products, onDelete }) {
  return (
    <div className="ptable">
      <div className="ptable__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Quantity</th>
              <th scope="col">Expiry</th>
              <th scope="col">Pickup</th>
              <th scope="col">Status</th>
              <th scope="col">Created</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const detailsPath = `/business/products/${product.id}`;
              return (
                <tr key={product.id}>
                  <td>
                    <div className="ptable__product">
                      {product.image ? (
                        <SmartImage className="ptable__thumb" src={getImageUrl(product.image)} alt="" fallbackIcon={Package} />
                      ) : (
                        <span className="ptable__thumb ptable__thumb--empty">
                          <Package size={20} aria-hidden="true" />
                        </span>
                      )}
                      <div>
                        <Link to={detailsPath} className="ptable__name">
                          {product.name}
                        </Link>
                        <span className="ptable__sub">{product.category}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{formatQuantity(product.availableQuantity, product.unit)}</strong>
                    <span className="ptable__sub">of {formatQuantity(product.totalQuantity, product.unit)}</span>
                  </td>
                  <td>
                    {formatDateTime(product.expiryDate)}
                    <ExpiryBadge level={product.expiryLevel} status={product.status} />
                  </td>
                  <td className="ptable__pickup">{formatPickupWindow(product.pickupStartTime, product.pickupEndTime)}</td>
                  <td>
                    <StatusBadge status={product.status} />
                  </td>
                  <td>{formatDate(product.createdAt)}</td>
                  <td>
                    <div className="ptable__actions">
                      <Link to={detailsPath} aria-label={`View ${product.name}`} title="View details">
                        <Eye size={17} />
                      </Link>
                      <Link to={`${detailsPath}/edit`} aria-label={`Edit ${product.name}`} title="Edit">
                        <Pencil size={17} />
                      </Link>
                      <button
                        type="button"
                        className="ptable__delete"
                        onClick={() => onDelete(product)}
                        aria-label={`Delete ${product.name}`}
                        title="Delete"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;