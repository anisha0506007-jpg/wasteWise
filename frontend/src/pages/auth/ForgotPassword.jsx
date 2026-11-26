import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail, MailCheck } from 'lucide-react';

import AuthLayout from '../../components/auth/AuthLayout.jsx';
import FormField from '../../components/auth/FormField.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import { forgotPassword } from '../../services/authService.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import { validateForgotForm } from '../../utils/validators.js';
import './ForgotPassword.css';

function ForgotPassword() {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState(''); // set after the request succeeds

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateForgotForm({ email });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSentTo(email.trim());
      toast.success('Check your email for the reset link.');
    } catch (error) {
      setErrors(getFieldErrors(error));
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setSentTo('');
    setEmail('');
  };

  return (
    <AuthLayout
      icon={KeyRound}
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to choose a new one."
      visualTitle="It happens to everyone."
      visualText="We will get you back to rescuing food in just a minute."
    >
      {sentTo ? (
        <div className="auth-status">
          <span className="auth-status__icon">
            <MailCheck size={26} aria-hidden="true" />
          </span>
          <h2>Check your inbox</h2>
          <p>
            If an account exists for <strong className="forgot__email">{sentTo}</strong>, we have
            sent a password reset link. It expires in 15 minutes.
          </p>
          <ul className="forgot__tips">
            <li>Check your spam or junk folder.</li>
            <li>The link can only be used once.</li>
          </ul>
          <Button variant="outline" onClick={handleTryAgain}>
            Use a different email
          </Button>
        </div>
      ) : (
        <>
          {formError && <Alert type="error">{formError}</Alert>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <FormField
              id="email"
              label="Email address"
              type="email"
              icon={Mail}
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors({});
              }}
              error={errors.email}
            />
            <Button type="submit" size="lg" fullWidth loading={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </>
      )}

      <p className="auth-switch">
        <Link to="/login" className="forgot__back">
          <ArrowLeft size={16} aria-hidden="true" /> Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;