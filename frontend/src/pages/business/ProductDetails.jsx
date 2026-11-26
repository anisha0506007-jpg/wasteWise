import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Info,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  Snowflake,
  Trash2,
  TriangleAlert,
  Utensils,
} from 'lucide-react';

import BusinessCard from '../../components/business/BusinessCard.jsx';
import PageHeading from '../../components/business/PageHeading.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import SmartImage from '../../components/common/SmartImage.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DeleteConfirmation from '../../components/products/DeleteConfirmation.jsx';
import ExpiryBadge from '../../components/products/ExpiryBadge.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { deleteProduct, getProduct, updateProductStatus } from '../../services/productService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { formatDate, formatQuantity } from '../../utils/format.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { formatDateOnly, formatDateTime, formatPickupWindow } from '../../utils/productFormat.js';
import './ProductDetails.css';

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data, loading, error, reload } = useFetch(() => getProduct(productId), productId);
  const product = data?.product;

  const [togglingStatus, setTogglingStatus] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleToggleStatus = async () => {
    const next = product.status === 'unavailable' ? 'available' : 'unavailable';
    setTogglingStatus(true);
    try {
      const result = await updateProductStatus(product.id, next);
      toast.success(result.message);
      await reload({ silent: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteProduct(product.id);
      toast.success(`${product.name} was deleted.`);
      navigate('/business/products', { replace: true });
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="pd" aria-busy="true">
        <Skeleton variant="title" />
        <div className="pd__skeletons">
          <Skeleton variant="chart" />
          <Skeleton variant="chart" />
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="pd">
        <PageHeading backTo="/business/products" backLabel="My products" title="Product details" />
        <BusinessCard>
          <EmptyState icon={TriangleAlert} tone="error" title="Could not load this product" text={error}>
            <Button size="sm" variant="outline" onClick={() => reload()}>
              Try again
            </Button>
            <Button to="/business/products" size="sm" leftIcon={<Package size={16} aria-hidden="true" />}>
              My products
            </Button>
          </EmptyState>
        </BusinessCard>
      </div>
    );
  }

  const isFinished = product.status === 'collected' || product.status === 'expired';
  const canToggle =
    product.status === 'unavailable' ||
    ['available', 'partially_reserved', 'fully_reserved'].includes(product.status);
  const isPaused = product.status === 'unavailable';
  const percentLeft =
    product.totalQuantity > 0
      ? Math.min(Math.round((product.availableQuantity / product.totalQuantity) * 100), 100)
      : 0;

  const tiles = [
    { label: 'Total', value: formatQuantity(product.totalQuantity, product.unit) },
    { label: 'Available', value: formatQuantity(product.availableQuantity, product.unit), strong: true },
    { label: 'Reserved', value: formatQuantity(product.reservedQuantity, product.unit) },
    { label: 'Collected', value: formatQuantity(product.collectedQuantity, product.unit) },
  ];

  const info = [
    { icon: Snowflake, label: 'Condition', value: product.condition },
    { icon: Calendar, label: 'Manufactured', value: product.manufacturingDate ? formatDateOnly(product.manufacturingDate) : 'Not provided' },
    { icon: Calendar, label: 'Expires', value: formatDateTime(product.expiryDate) },
    { icon: Info, label: 'Storage instructions', value: product.storageInstructions || 'None provided' },
    { icon: Utensils, label: 'Dietary information', value: product.dietaryInformation || 'None provided' },
  ];

  return (
    <div className="pd">
      <PageHeading
        backTo="/business/products"
        backLabel="My products"
        title={product.name}
        subtitle={`${product.category} · Listed ${formatDate(product.createdAt)}`}
        actions={
          <>
            {!isFinished || product.status === 'expired' ? (
              <Button to={`/business/products/${product.id}/edit`} leftIcon={<Pencil size={16} aria-hidden="true" />}>
                Edit Product
              </Button>
            ) : null}
            {canToggle && (
              <Button
                variant="outline"
                onClick={handleToggleStatus}
                loading={togglingStatus}
                leftIcon={isPaused ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
              >
                {isPaused ? 'Make Available' : 'Mark Unavailable'}
              </Button>
            )}
            <Button
              variant="outline"
              className="pd__delete"
              onClick={() => {
                setDeleteError('');
                setConfirmingDelete(true);
              }}
              leftIcon={<Trash2 size={16} aria-hidden="true" />}
            >
              Delete
            </Button>
          </>
        }
      />

      {/* Expiry warnings come from the server's own clock calculation */}
      {product.expiryLevel === 'expired' && product.status !== 'collected' && (
        <Alert type="error">
          This listing has expired. It cannot receive new donation requests.
        </Alert>
      )}
      {product.expiryLevel === 'urgent' && product.status !== 'collected' && (
        <Alert type="info">
          <strong>Urgent:</strong> this product expires within 24 hours. Respond to requests quickly.
        </Alert>
      )}
      {product.expiryLevel === 'soon' && product.status !== 'collected' && (
        <Alert type="info">This product expires within 3 days.</Alert>
      )}
      {isPaused && (
        <Alert type="info">This listing is marked unavailable, so no one can request it right now.</Alert>
      )}

      <div className="pd__layout">
        <div className="pd__media">
          {product.image ? (
            <SmartImage className="pd__image" src={getImageUrl(product.image)} alt={product.name} fallbackIcon={Package} />
          ) : (
            <span className="pd__image pd__image--empty">
              <Package size={56} aria-hidden="true" />
              <span>No image provided</span>
            </span>
          )}
        </div>

        <div className="pd__main">
          <BusinessCard>
            <div className="pd__status-row">
              <StatusBadge status={product.status} />
              <ExpiryBadge level={product.expiryLevel} status={product.status} />
            </div>

            {product.description && <p className="pd__description">{product.description}</p>}

            <ul className="pd__tiles">
              {tiles.map((tile) => (
                <li key={tile.label} className={tile.strong ? 'pd__tile pd__tile--strong' : 'pd__tile'}>
                  <span>{tile.label}</span>
                  <strong>{tile.value}</strong>
                </li>
              ))}
            </ul>
            <div className="pd__bar" aria-hidden="true">
              <span style={{ width: `${percentLeft}%` }} />
            </div>
            <p className="pd__bar-label">{percentLeft}% still available</p>
          </BusinessCard>

          <BusinessCard title="Product information">
            <dl className="pd__info">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="pd__info-item">
                  <span className="pd__info-icon">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </BusinessCard>

          <BusinessCard title="Pickup details">
            <dl className="pd__info">
              <div className="pd__info-item">
                <span className="pd__info-icon">
                  <MapPin size={17} aria-hidden="true" />
                </span>
                <div>
                  <dt>Pickup location</dt>
                  <dd>
                    {product.pickupAddress}, {product.city}, {product.state} {product.postalCode}
                  </dd>
                </div>
              </div>
              <div className="pd__info-item">
                <span className="pd__info-icon">
                  <Clock size={17} aria-hidden="true" />
                </span>
                <div>
                  <dt>Pickup window</dt>
                  <dd>{formatPickupWindow(product.pickupStartTime, product.pickupEndTime)}</dd>
                </div>
              </div>
              <div className="pd__info-item">
                <span className="pd__info-icon">
                  <ShieldCheck size={17} aria-hidden="true" />
                </span>
                <div>
                  <dt>Special instructions</dt>
                  <dd>{product.pickupInstructions || 'None provided'}</dd>
                </div>
              </div>
            </dl>
          </BusinessCard>
        </div>
      </div>

      <DeleteConfirmation
        open={confirmingDelete}
        productName={product.name}
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setConfirmingDelete(false)}
      />
    </div>
  );
}

export default ProductDetails;