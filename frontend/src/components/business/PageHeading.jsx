import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import './PageHeading.css';

// Props: title, subtitle, backTo, backLabel, actions (buttons)
function PageHeading({ title, subtitle, backTo, backLabel = 'Back', actions }) {
  return (
    <header className="ph">
      <div className="ph__text">
        {backTo && (
          <Link to={backTo} className="ph__back">
            <ArrowLeft size={16} aria-hidden="true" /> {backLabel}
          </Link>
        )}
        <h2 className="ph__title">{title}</h2>
        {subtitle && <p className="ph__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="ph__actions">{actions}</div>}
    </header>
  );
}

export default PageHeading;