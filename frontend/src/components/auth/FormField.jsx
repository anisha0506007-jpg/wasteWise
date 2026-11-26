import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import './FormField.css';

/**
 * Props:
 *  id, label, error, hint, icon (Lucide component), required
 *  as   - 'input' (default) | 'select' | 'textarea'
 *  type - input type; 'password' adds a show/hide button
 *  Any other prop (value, onChange, placeholder, autoComplete...) goes to the field.
 */
function FormField({
  id,
  label,
  error,
  hint,
  icon: Icon,
  required = false,
  as = 'input',
  type = 'text',
  className = '',
  children,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const Control = as;
  const isPassword = as === 'input' && type === 'password';
  const inputType = as === 'input' ? (isPassword && showPassword ? 'text' : type) : undefined;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && (
          <span className="form-required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className={`field__control ${error ? 'field__control--error' : ''}`}>
        {Icon && (
          <span className="field__icon">
            <Icon size={18} aria-hidden="true" />
          </span>
        )}

        <Control
          id={id}
          name={id}
          type={inputType}
          className="field__input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          required={required}
          {...rest}
        >
          {children}
        </Control>

        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="form-hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export default FormField;