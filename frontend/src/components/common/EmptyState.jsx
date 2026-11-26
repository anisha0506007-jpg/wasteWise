import './EmptyState.css';

/**
 * Props: icon (Lucide component), title, text, tone ('default' | 'error'), compact
 * children = optional buttons
 */
function EmptyState({ icon: Icon, title, text, tone = 'default', compact = false, children }) {
  return (
    <div className={`empty-state empty-state--${tone} ${compact ? 'empty-state--compact' : ''}`}>
      {Icon && (
        <span className="empty-state__icon">
          <Icon size={compact ? 22 : 28} aria-hidden="true" />
        </span>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {text && <p className="empty-state__text">{text}</p>}
      {children && <div className="empty-state__actions">{children}</div>}
    </div>
  );
}

export default EmptyState;