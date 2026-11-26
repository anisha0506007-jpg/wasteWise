import { Check, Circle } from 'lucide-react';

import { getPasswordChecks } from '../../utils/validators.js';
import './PasswordStrength.css';

function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = getPasswordChecks(password);
  const passedCount = checks.filter((check) => check.passed).length;
  const level = passedCount <= 2 ? 'weak' : passedCount <= 4 ? 'medium' : 'strong';
  const levelLabel = { weak: 'Weak', medium: 'Getting there', strong: 'Strong' }[level];

  return (
    <div className="pw-strength" aria-live="polite">
      <div className="pw-strength__top">
        <div className="pw-strength__bar">
          <span className={`pw-strength__fill pw-strength__fill--${passedCount} pw-strength__fill--${level}`} />
        </div>
        <span className={`pw-strength__label pw-strength__label--${level}`}>{levelLabel}</span>
      </div>

      <ul className="pw-strength__list">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`pw-strength__item ${check.passed ? 'pw-strength__item--passed' : ''}`}
          >
            {check.passed ? <Check size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordStrength;