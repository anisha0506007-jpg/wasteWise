import './BusinessCard.css';

function BusinessCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`bz-card ${className}`}>
      {(title || action) && (
        <header className="bz-card__header">
          <div>
            {title && <h2 className="bz-card__title">{title}</h2>}
            {subtitle && <p className="bz-card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="bz-card__action">{action}</div>}
        </header>
      )}
      <div className="bz-card__body">{children}</div>
    </section>
  );
}

export default BusinessCard;