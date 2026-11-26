import { Check, Leaf } from 'lucide-react';

import SmartImage from '../common/SmartImage.jsx';
import './AuthLayout.css';

const DEFAULT_POINTS = [
  'List or find surplus food in minutes',
  'Expiry-aware pickups so nothing goes to waste',
  'Built for businesses, NGOs, and neighbours',
];

/**
 * Split-screen layout for all authentication pages.
 * Props:
 *  icon, title, subtitle   - heading of the form card
 *  visualTitle/visualText  - text on the green image panel (hidden on mobile)
 *  wide                    - wider card (used by the Register page)
 */
function AuthLayout({
  children,
  icon: Icon,
  title,
  subtitle,
  visualTitle = 'Rescue food. Reduce waste.',
  visualText = 'Join the community turning surplus into meals, one pickup at a time.',
  points = DEFAULT_POINTS,
  wide = false,
}) {
  return (
    <section className="auth">
      {/* Left: image panel */}
      <aside className="auth__visual" aria-hidden="true">
        <div className="auth__media">
          <SmartImage className="auth__image" src="/images/hero-food-donation.jpg" alt="" />
        </div>
        <div className="auth__overlay" />

        <div className="auth__visual-content">
          <span className="auth__visual-badge">
            <Leaf size={22} />
          </span>
          <h2 className="auth__visual-title">{visualTitle}</h2>
          <p className="auth__visual-text">{visualText}</p>
          <ul className="auth__visual-points">
            {points.map((point) => (
              <li key={point}>
                <span className="auth__visual-check">
                  <Check size={14} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Right: form card */}
      <div className="auth__panel">
        <div className={`auth__card ${wide ? 'auth__card--wide' : ''}`}>
          <header className="auth__header">
            {Icon && (
              <span className="auth__icon">
                <Icon size={26} aria-hidden="true" />
              </span>
            )}
            <h1 className="auth__title">{title}</h1>
            {subtitle && <p className="auth__subtitle">{subtitle}</p>}
          </header>

          {children}
        </div>
      </div>
    </section>
  );
}

export default AuthLayout;