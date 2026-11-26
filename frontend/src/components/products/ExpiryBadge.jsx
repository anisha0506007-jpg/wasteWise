import { Clock, Lock, TriangleAlert } from 'lucide-react';

import './ExpiryBadge.css';

const LEVELS = {
  urgent: { icon: TriangleAlert, text: 'Urgent: expires within 24 hours' },
  soon: { icon: Clock, text: 'Expires within 3 days' },
  expired: { icon: Lock, text: 'Expired: no new requests' },
};

// Props: level (from the API), status (so finished listings show no warning)
function ExpiryBadge({ level, status }) {
  if (status === 'collected' || !LEVELS[level]) return null;
  const { icon: Icon, text } = LEVELS[level];

  return (
    <span className={`expiry-badge expiry-badge--${level}`}>
      <Icon size={13} aria-hidden="true" /> {text}
    </span>
  );
}

export default ExpiryBadge;