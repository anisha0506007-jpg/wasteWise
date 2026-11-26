import { Link } from 'react-router-dom';

import Loader from './Loader.jsx';
import './Button.css';
function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  to,
  href,
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? (
        <Loader size="sm" />
      ) : (
        leftIcon && <span className="btn__icon">{leftIcon}</span>
      )}
      <span className="btn__label">{children}</span>
      {!loading && rightIcon && <span className="btn__icon">{rightIcon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {content}
    </button>
  );
}

export default Button;