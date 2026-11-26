import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Building2, ChevronDown, Globe, LogOut, Menu, Search } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getInitials } from '../../utils/format.js';
import './BusinessHeader.css';

/**
 * Props: title, unreadCount, onMenuClick, onLogout
 */
function BusinessHeader({ title, unreadCount = 0, onMenuClick, onLogout }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const businessName = user.organizationName || user.name;
  const imageUrl = getImageUrl(user.profileImage);
  const closeMenu = () => setMenuOpen(false);

  // Close the dropdown when clicking outside it or pressing Escape
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Search opens the products page with the search word in the URL
  const handleSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) {
      searchRef.current?.focus();
      return;
    }
    navigate(`/business/products?search=${encodeURIComponent(term)}`);
  };

  return (
    <header className="bz-header">
      <div className="bz-header__left">
        <button
          type="button"
          className="bz-header__menu"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="bz-header__title">{title}</h1>
      </div>

      <div className="bz-header__right">
        <Link
          to="/business/notifications"
          className="bz-header__icon-btn"
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
          }
        >
          <Bell size={20} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="bz-header__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </Link>

        <div className="bz-profile" ref={menuRef}>
          <button
            type="button"
            className="bz-profile__button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="bz-profile__avatar">
              {imageUrl ? <img src={imageUrl} alt="" /> : getInitials(businessName)}
            </span>
            <span className="bz-profile__name">{businessName}</span>
            <ChevronDown size={16} aria-hidden="true" className="bz-profile__chevron" />
          </button>

          {menuOpen && (
            <div className="bz-profile__menu" role="menu">
              <div className="bz-profile__summary">
                <strong>{businessName}</strong>
                <span>{user.email}</span>
              </div>
              <Link to="/business/profile" role="menuitem" onClick={closeMenu}>
                <Building2 size={16} aria-hidden="true" /> Business Profile
              </Link>
              <Link to="/business/notifications" role="menuitem" onClick={closeMenu}>
                <Bell size={16} aria-hidden="true" /> Notifications
              </Link>
              <Link to="/" role="menuitem" onClick={closeMenu}>
                <Globe size={16} aria-hidden="true" /> Back to website
              </Link>
              <button
                type="button"
                role="menuitem"
                className="bz-profile__logout"
                onClick={() => {
                  closeMenu();
                  onLogout();
                }}
              >
                <LogOut size={16} aria-hidden="true" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <form className="bz-search" onSubmit={handleSearch} role="search">
        <Search size={18} className="bz-search__icon" aria-hidden="true" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your products..."
          aria-label="Search your products"
        />
      </form>
    </header>
  );
}

export default BusinessHeader;