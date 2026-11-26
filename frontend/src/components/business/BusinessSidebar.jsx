import { NavLink } from 'react-router-dom';
import {
  Bell,
  Building2,
  History as HistoryIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  PackagePlus,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

import Logo from '../common/Logo.jsx';
import './BusinessSidebar.css';

const NAV_ITEMS = [
  { label: 'Overview', to: '/business/dashboard', icon: LayoutDashboard },
  { label: 'My Products', to: '/business/products', icon: Package },
  { label: 'Add Surplus Product', to: '/business/products/new', icon: PackagePlus },
  { label: 'Donation Requests', to: '/business/requests', icon: Inbox },
  { label: 'Donation History', to: '/business/history', icon: HistoryIcon },
  { label: 'Analytics', to: '/business/analytics', icon: TrendingUp },
  { label: 'AI Waste Assistant', to: '/business/ai-assistant', icon: Sparkles },
  { label: 'Notifications', to: '/business/notifications', icon: Bell, showBadge: true },
  { label: 'Business Profile', to: '/business/profile', icon: Building2 },
];

/**
 * Desktop: always visible (fixed). Tablet/mobile: a drawer that slides in.
 * Props: open, onClose, onLogout, unreadCount
 */
function BusinessSidebar({ open, onClose, onLogout, unreadCount = 0 }) {
  return (
    <>
      <div
        className={`bz-overlay ${open ? 'bz-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`bz-sidebar ${open ? 'bz-sidebar--open' : ''}`} aria-label="Business navigation">
        <div className="bz-sidebar__top">
          <Logo variant="light" />
          <button
            type="button"
            className="bz-sidebar__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="bz-sidebar__nav">
          <ul>
            {NAV_ITEMS.map(({ label, to, icon: Icon, showBadge }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `bz-nav__link ${isActive ? 'bz-nav__link--active' : ''}`
                  }
                >
                  <Icon size={19} aria-hidden="true" />
                  <span>{label}</span>
                  {showBadge && unreadCount > 0 && (
                    <span className="bz-nav__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button type="button" className="bz-sidebar__logout" onClick={onLogout}>
          <LogOut size={19} aria-hidden="true" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}

export default BusinessSidebar;