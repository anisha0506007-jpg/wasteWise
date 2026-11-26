import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

import './Logo.css';

/**
 * WasteWise logo.
 *
 * Props:
 *  variant  - 'default' (for light backgrounds) | 'light' (for dark backgrounds)
 *  size     - 'sm' | 'md' | 'lg'
 *  linkTo   - route to open on click ('' makes it non-clickable)
 *  showText - hide the text to show only the icon
 */
function Logo({ variant = 'default', size = 'md', linkTo = '/', showText = true }) {
  const classes = `logo logo--${variant} logo--${size}`;

  const content = (
    <>
      <span className="logo__icon">
        <Leaf aria-hidden="true" />
      </span>
      {showText && (
        <span className="logo__text">
          Waste<span>Wise</span>
        </span>
      )}
    </>
  );

  if (!linkTo) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link to={linkTo} className={classes} aria-label="WasteWise home">
      {content}
    </Link>
  );
}

export default Logo;