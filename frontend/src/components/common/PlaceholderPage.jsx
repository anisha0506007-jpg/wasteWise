import './PlaceholderPage.css';

/**
 * Temporary page used for routes that are not built yet.
 *
 * Props:
 *  icon        - a Lucide icon COMPONENT (e.g. icon={LogIn})
 *  badge       - small label above the title
 *  title       - page heading
 *  description - short explanation text
 *  children    - optional buttons / links
 */
function PlaceholderPage({
  icon: Icon,
  badge = 'Coming soon',
  title,
  description,
  children,
}) {
  return (
    <section className="placeholder">
      <div className="container">
        <div className="placeholder__card">
          {Icon && (
            <span className="placeholder__icon">
              <Icon size={32} aria-hidden="true" />
            </span>
          )}
          <span className="placeholder__badge">{badge}</span>
          <h1 className="placeholder__title">{title}</h1>
          <p className="placeholder__description">{description}</p>
          {children && <div className="placeholder__actions">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export default PlaceholderPage;