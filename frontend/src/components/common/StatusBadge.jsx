import './StatusBadge.css';

// [label, colour]
const STATUS_STYLES = {
  // donation requests
  pending: ['Pending', 'orange'],
  accepted: ['Accepted', 'green-soft'],
  collected: ['Collected', 'green'],
  rejected: ['Rejected', 'red'],
  // product listings
  available: ['Available', 'green-soft'],
  partially_reserved: ['Partially Reserved', 'orange'],
  fully_reserved: ['Fully Reserved', 'orange-solid'],
  expired: ['Expired', 'red'],
  unavailable: ['Unavailable', 'grey'],
  // expiry alerts
  expires_today: ['Expires Today', 'orange-solid'],
  expiring_soon: ['Expiring Soon', 'orange'],
  // older names kept so nothing breaks
  donated: ['Donated', 'green'],
  cancelled: ['Cancelled', 'grey'],
};

function StatusBadge({ status }) {
  const [label, tone] = STATUS_STYLES[status] || [status, 'grey'];
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>;
}

export default StatusBadge;