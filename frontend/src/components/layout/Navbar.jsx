import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

import Logo from '../common/Logo.jsx';
import Button from '../common/Button.jsx';
import NavbarGreeting from './NavbarGreeting.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import useScrollSpy from '../../hooks/useScrollSpy.js';
import './Navbar.css';

// One place to edit navigation. sectionId must match the section's id on the page.
const NAV_LINKS = [
  { label: 'Home', to: '/', sectionId: null },
  { label: 'How It Works', to: '/#how-it-works', sectionId: 'how-it-works' },
  { label: 'Features', to: '/#features', sectionId: 'features' },
  { label: 'About Us', to: '/#about', sectionId: 'about' },
  { label: 'Contact', to: '/#contact', sectionId: 'contact' },
];

// Defined outside the component so the array stays the same between renders
const SECTION_IDS = NAV_LINKS.filter((link) => link.sectionId).map((link) => link.sectionId);

const DESKTOP_BREAKPOINT = 900;

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 10);

  const isHomePage = location.pathname === '/';
  const activeSection = useScrollSpy(SECTION_IDS, { enabled: isHomePage });

  // Highlight a link only on the landing page, based on the visible section
  const isLinkActive = (link) => {
    if (!isHomePage) return false;
    return link.sectionId ? activeSection === link.sectionId : activeSection === '';
  };

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = async () => {
    closeMenu();
    navigate('/', { replace: true }); // leave protected pages first
    try {
      await logout();
      toast.success('You have been logged out.');
    } catch {
      toast.error('Could not log out. Please check your connection and try again.');
    }
  };

  // Add a shadow once the user scrolls down
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu with Escape or when the window gets wide
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Stop the page behind the menu from scrolling while it is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Logo />

        {/* Desktop links */}
        <nav className="navbar__links" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.label}
                to={link.to}
                aria-current={active ? 'location' : undefined}
                className={`navbar__link ${active ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop buttons */}
        <div className="navbar__actions">
          {user ? (
            <>
              <NavbarGreeting user={user} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut size={16} aria-hidden="true" />}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link navbar__link--login">
                Login
              </Link>
              <Button to="/register" size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="navbar__toggle"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      <div id="mobile-menu" className={`navbar__mobile ${isOpen ? 'navbar__mobile--open' : ''}`}>
        <nav className="navbar__mobile-links" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.label}
                to={link.to}
                onClick={closeMenu}
                aria-current={active ? 'location' : undefined}
                className={`navbar__mobile-link ${active ? 'navbar__mobile-link--active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="navbar__mobile-actions">
          {user ? (
            <>
              <NavbarGreeting user={user} onClick={closeMenu} />
              <Button
                variant="outline"
                fullWidth
                onClick={handleLogout}
                leftIcon={<LogOut size={16} aria-hidden="true" />}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="outline" fullWidth onClick={closeMenu}>
                Login
              </Button>
              <Button to="/register" fullWidth onClick={closeMenu}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;