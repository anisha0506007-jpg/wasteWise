import { CircleAlert, CircleCheck, Info } from 'lucide-react';

import './Alert.css';

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };
function Alert({ type = 'info', children, className = '' }) {
  const Icon = ICONS[type] || Info;

  return (
    <div
      className={`alert alert--${type} ${className}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <Icon size={18} className="alert__icon" aria-hidden="true" />
      <div className="alert__body">{children}</div>
    </div>
  );
}

export default Alert;