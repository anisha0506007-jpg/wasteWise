import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import AuthLayout from '../../components/auth/AuthLayout.jsx';
import FormField from '../../components/auth/FormField.jsx';
import PasswordStrength from '../../components/auth/PasswordStrength.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../hooks/useToast.js';
import { resetPassword } from '../../services/authService.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import { validateResetForm } from '../../utils/validators.js';
import './ResetPassword.css';

function ResetPassword() {
  const { token } = useParams(); // from the URL: /reset-password/:token
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [linkProblem, setLinkProblem] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateResetForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      toast.success('Password updated. You can now log in.');
      navigate('/login', { replace: true });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      setErrors(fieldErrors);

      // A problem with the token itself means the link is bad, expired, or already used
      if (fieldErrors.token || error.response?.status === 400) {
        if (!fieldErrors.password && !fieldErrors.confirmPassword) setLinkProblem(true);
      }

      const message = getErrorMessage(error);
      setFormError(fieldErrors.token || message);
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      icon={ShieldCheck}
      title="Choose a new password"
      subtitle="Create a strong password you have not used before."
      visualTitle="Almost there."
      visualText="Set a new password and get back to turning surplus into something meaningful."
    >
      {formError && (
        <Alert type="error">
          {formError}
          {linkProblem && (
            <>
              {' '}
              <Link to="/forgot-password">Request a new link</Link>
            </>
          )}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField
          id="password"
          label="New password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <PasswordStrength password={values.password} />

        <FormField
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? 'Updating...' : 'Update Password'}
        </Button>
      </form>

      <p className="auth-switch">
        <Link to="/login" className="reset__back">
          <ArrowLeft size={16} aria-hidden="true" /> Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ResetPassword;