import { HeartHandshake, Store, User } from 'lucide-react';

import './RoleSelector.css';

// Admin is intentionally NOT here. It can never be chosen in public registration.
const ROLE_OPTIONS = [
  { id: 'business', icon: Store, title: 'Business', text: 'Restaurant, bakery, store or hotel with surplus food' },
  { id: 'ngo', icon: HeartHandshake, title: 'NGO', text: 'Charity or organization collecting food for others' },
  { id: 'individual', icon: User, title: 'Individual', text: 'A neighbour who wants to collect or share food' },
];

function RoleSelector({ value, onChange, error }) {
  return (
    <fieldset className="role-selector">
      <legend className="form-label">I am registering as a...</legend>

      <div className="role-selector__grid">
        {ROLE_OPTIONS.map(({ id, icon: Icon, title, text }) => (
          <label
            key={id}
            className={`role-card ${value === id ? 'role-card--selected' : ''}`}
          >
            <input
              type="radio"
              name="role"
              value={id}
              checked={value === id}
              onChange={onChange}
              className="role-card__input"
            />
            <span className="role-card__icon">
              <Icon size={22} aria-hidden="true" />
            </span>
            <span className="role-card__title">{title}</span>
            <span className="role-card__text">{text}</span>
          </label>
        ))}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export default RoleSelector;