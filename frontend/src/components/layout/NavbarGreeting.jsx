import { Link } from 'react-router-dom';

import { getImageUrl } from '../../utils/imageUrl.js';
import { ROLE_LABELS, getDashboardPath } from '../../utils/roles.js';
import './NavbarGreeting.css';

function NavbarGreeting({ user, onClick }) {
  const parts = user.name.split(' ').filter(Boolean);
  const firstName = parts[0] || 'Account';
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  const imageUrl = getImageUrl(user.profileImage);

  return (
    <Link
      to={getDashboardPath(user.role)}
      className="nav-user"
      onClick={onClick}
      title="Go to your dashboard"
    >
      <span className="nav-user__avatar">
        {imageUrl ? <img src={imageUrl} alt="" /> : initials}
      </span>
      <span className="nav-user__text">
        <span className="nav-user__name">{firstName}</span>
        <span className="nav-user__role">{ROLE_LABELS[user.role]}</span>
      </span>
    </Link>
  );
}

export default NavbarGreeting;