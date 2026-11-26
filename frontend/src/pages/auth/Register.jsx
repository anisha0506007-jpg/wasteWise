import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Building2, Hash, Mail, MapPin, Phone, User, UserPlus } from 'lucide-react';

import AuthLayout from '../../components/auth/AuthLayout.jsx';
import FormField from '../../components/auth/FormField.jsx';
import ImageUpload from '../../components/auth/ImageUpload.jsx';
import PasswordStrength from '../../components/auth/PasswordStrength.jsx';
import RoleSelector from '../../components/auth/RoleSelector.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import { BUSINESS_TYPES, PUBLIC_ROLE_IDS } from '../../utils/roles.js';
import { validateImageFile, validateRegisterForm } from '../../utils/validators.js';
import './Register.css';

// Labels change with the selected role
const ROLE_TEXT = {
  business: {
    nameLabel: 'Your full name',
    orgLabel: 'Business name',
    orgPlaceholder: 'e.g. Green Leaf Bakery',
    addressLabel: 'Business address',
  },
  ngo: {
    nameLabel: 'Contact person full name',
    orgLabel: 'NGO name',
    orgPlaceholder: 'e.g. Hope Food Foundation',
    addressLabel: 'Organization address',
  },
  individual: {
    nameLabel: 'Full name',
    addressLabel: 'Home address',
  },
};

const INITIAL_VALUES = {
  role: 'business',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  organizationName: '',
  businessType: '',
  ngoRegistrationNumber: '',
  address: '',
  city: '',
  state: '',
};

// Builds the multipart form (needed because of the optional photo)
const buildFormData = (values, imageFile) => {
  const formData = new FormData();

  ['role', 'name', 'email', 'phone', 'address', 'city', 'state'].forEach((key) => {
    formData.append(key, values[key].trim());
  });
  // Passwords are sent exactly as typed (never trimmed)
  formData.append('password', values.password);
  formData.append('confirmPassword', values.confirmPassword);

  if (values.role === 'business' || values.role === 'ngo') {
    formData.append('organizationName', values.organizationName.trim());
  }
  if (values.role === 'business') {
    formData.append('businessType', values.businessType);
  }
  if (values.role === 'ngo' && values.ngoRegistrationNumber.trim()) {
    formData.append('ngoRegistrationNumber', values.ngoRegistrationNumber.trim());
  }
  if (imageFile) formData.append('profileImage', imageFile);

  return formData;
};

function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // The landing page links here with ?role=business or ?role=ngo
  const roleFromUrl = searchParams.get('role');
  const [values, setValues] = useState({
    ...INITIAL_VALUES,
    role: PUBLIC_ROLE_IDS.includes(roleFromUrl) ? roleFromUrl : INITIAL_VALUES.role,
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const text = ROLE_TEXT[values.role];
  const isOrganization = values.role === 'business' || values.role === 'ngo';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageSelect = (file) => {
    const message = validateImageFile(file);
    if (message) {
      setImageFile(null);
      setErrors((prev) => ({ ...prev, profileImage: message }));
      return;
    }
    setImageFile(file);
    setErrors((prev) => ({ ...prev, profileImage: '' }));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setErrors((prev) => ({ ...prev, profileImage: '' }));
  };

  const focusFirstError = () => {
    setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateRegisterForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormError('Please fix the highlighted fields and try again.');
      focusFirstError();
      return;
    }

    setSubmitting(true);
    try {
      await register(buildFormData(values, imageFile));
      toast.success('Account created successfully! Please log in.');
      navigate('/login', {
        replace: true,
        state: { registeredEmail: values.email.trim().toLowerCase() },
      });
    } catch (error) {
      setErrors(getFieldErrors(error)); // e.g. "email already exists" under the email field
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
      focusFirstError();
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      wide
      icon={UserPlus}
      title="Create your account"
      subtitle="Join WasteWise and help turn surplus into opportunity."
      visualTitle="Join the food-rescue community."
      visualText="Whether you have surplus to share or people to feed, there is a place for you here."
    >
      {formError && <Alert type="error">{formError}</Alert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <RoleSelector value={values.role} onChange={handleChange} error={errors.role} />

        {/* ---------- Account details ---------- */}
        <h2 className="register__section">Account details</h2>
        <div className="register__grid">
          <FormField
            id="name"
            label={text.nameLabel}
            icon={User}
            required
            autoComplete="name"
            placeholder="e.g. Aarav Mehta"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
          <FormField
            id="phone"
            label="Phone number"
            type="tel"
            icon={Phone}
            required
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <FormField
            id="email"
            label="Email address"
            type="email"
            icon={Mail}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="register__full"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />
          <FormField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
        </div>
        <PasswordStrength password={values.password} />

        {/* ---------- Role-specific fields ---------- */}
        {isOrganization && (
          <div className="register__role-fields" key={values.role}>
            <h2 className="register__section">
              {values.role === 'business' ? 'Business details' : 'Organization details'}
            </h2>
            <div className="register__grid">
              <FormField
                id="organizationName"
                label={text.orgLabel}
                icon={Building2}
                required
                placeholder={text.orgPlaceholder}
                className={values.role === 'ngo' ? '' : 'register__full'}
                value={values.organizationName}
                onChange={handleChange}
                error={errors.organizationName}
              />

              {values.role === 'business' && (
                <FormField
                  id="businessType"
                  as="select"
                  label="Business type"
                  icon={Briefcase}
                  required
                  className="register__full"
                  value={values.businessType}
                  onChange={handleChange}
                  error={errors.businessType}
                >
                  <option value="">Select a business type</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </FormField>
              )}

              {values.role === 'ngo' && (
                <FormField
                  id="ngoRegistrationNumber"
                  label="Registration number (optional)"
                  icon={Hash}
                  placeholder="e.g. NGO/2020/12345"
                  value={values.ngoRegistrationNumber}
                  onChange={handleChange}
                  error={errors.ngoRegistrationNumber}
                />
              )}
            </div>
          </div>
        )}

        {/* ---------- Location ---------- */}
        <h2 className="register__section">Location</h2>
        <div className="register__grid">
          <FormField
            id="address"
            as="textarea"
            rows={2}
            label={text.addressLabel}
            icon={MapPin}
            required
            autoComplete="street-address"
            placeholder="Street, area, landmark"
            className="register__full"
            value={values.address}
            onChange={handleChange}
            error={errors.address}
          />
          <FormField
            id="city"
            label="City"
            required
            autoComplete="address-level2"
            placeholder="e.g. Sonipat"
            value={values.city}
            onChange={handleChange}
            error={errors.city}
          />
          <FormField
            id="state"
            label="State"
            required
            autoComplete="address-level1"
            placeholder="e.g. Haryana"
            value={values.state}
            onChange={handleChange}
            error={errors.state}
          />
        </div>

        <ImageUpload
          file={imageFile}
          onSelect={handleImageSelect}
          onRemove={handleImageRemove}
          error={errors.profileImage}
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;