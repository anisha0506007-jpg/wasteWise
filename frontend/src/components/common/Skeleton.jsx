import './Skeleton.css';

function Skeleton({ variant = 'text', className = '' }) {
  return <span className={`skeleton skeleton--${variant} ${className}`} aria-hidden="true" />;
}

export default Skeleton;