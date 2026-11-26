import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, LogIn, Mail } from 'lucide-react';

import AuthLayout from '../../components/auth/AuthLayout.jsx';
import FormField from '../../components/auth/FormField.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import { validateLoginForm } from '../../utils/validators.js';
import './Login.css';

function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const location = useLocation();

  // Set by the Register page after a successful sign-up
  const registeredEmail = location.state?.registeredEmail || '';

  const [values, setValues] = useState({
    email: registeredEmail,
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateLoginForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login({
        email: values.email.trim(),
        password: values.password,
        rememberMe: values.rememberMe,
      });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      // GuestRoute notices that `user` is now set and redirects to the right dashboard.
    } catch (error) {
      setErrors(getFieldErrors(error));
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to manage and rescue surplus food."
      visualTitle="Good to see you again."
      visualText="Pick up where you left off and keep turning surplus into meals."
    >
      {registeredEmail && !formError && (
        <Alert type="success">Your account is ready. Log in to continue.</Alert>
      )}
      {formError && <Alert type="error">{formError}</Alert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Email address"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          icon={Lock}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="login__row">
          <label className="login__remember">
            <input
              type="checkbox"
              name="rememberMe"
              checked={values.rememberMe}
              onChange={handleChange}
            />
            <span>Remember me for 30 days</span>
          </label>
          <Link to="/forgot-password" className="login__forgot">
            Forgot password?
          </Link>
        </div>
        <p className="login__hint">Only use &ldquo;Remember me&rdquo; on your own device.</p>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <p className="auth-switch">
        New to WasteWise? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;