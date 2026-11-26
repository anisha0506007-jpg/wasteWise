import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

import Logo from '../common/Logo.jsx';
import SocialIcon from '../common/SocialIcon.jsx';
import './Footer.css';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Features', to: '/#features' },
  { label: 'About Us', to: '/#about' },
  { label: 'FAQ', to: '/#faq' },
];

const PLATFORM_LINKS = [
  { label: 'Explore Donations', to: '/explore' },
  { label: 'For Businesses', to: '/#benefits' },
  { label: 'For NGOs', to: '/#benefits' },
  { label: 'Login', to: '/login' },
  { label: 'Get Started', to: '/register' },
  // Developer tool from Phase 1. Remove this line before launching.
  { label: 'Test Connection', to: '/test-connection' },
];

const SOCIAL_LINKS = [
  { name: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { name: 'twitter', label: 'Twitter', href: 'https://twitter.com' },
  { name: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  { name: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
];

// Placeholder contact details. Replace with your real ones.
const CONTACT_DETAILS = [
  {
    icon: Mail,
    text: 'hello@wastewise.com',
    href: 'mailto:hello@wastewise.com',
  },
  {
    icon: Phone,
    text: '+91 98765 43210',
    href: 'tel:+919876543210',
  },
  {
    icon: MapPin,
    text: 'Green Park, New Delhi, India',
    href: null,
  },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Logo variant="light" />
            <p className="footer__description">
              WasteWise connects businesses, NGOs, and individuals to reduce
              food waste, feed communities, and build a more sustainable
              future together.
            </p>
            <ul className="footer__socials">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    className="footer__social"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon name={social.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <nav className="footer__column" aria-label="Quick links">
            <h3 className="footer__title">Quick Links</h3>
            <ul className="footer__list">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Platform links */}
          <nav className="footer__column" aria-label="Platform">
            <h3 className="footer__title">Platform</h3>
            <ul className="footer__list">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="footer__column">
            <h3 className="footer__title">Contact Us</h3>
            <ul className="footer__list">
              {CONTACT_DETAILS.map(({ icon: Icon, text, href }) => (
                <li key={text} className="footer__contact-item">
                  <Icon size={18} aria-hidden="true" />
                  {href ? (
                    <a href={href} className="footer__link">
                      {text}
                    </a>
                  ) : (
                    <span>{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {currentYear} WasteWise. All rights reserved.</p>
          <p>Made with care to reduce waste.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;