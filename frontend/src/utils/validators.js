// Keep these two patterns identical to backend/src/validators/authValidators.js
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;
const NGO_REG_REGEX = new RegExp('^[A-Za-z0-9/ -]{3,50}$');

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const getPasswordChecks = (password = '') => [
  { id: 'length', label: '8 to 64 characters', passed: password.length >= 8 && password.length <= 64 },
  { id: 'lower', label: 'One lowercase letter', passed: /[a-z]/.test(password) },
  { id: 'upper', label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
  { id: 'number', label: 'One number', passed: /\d/.test(password) },
  { id: 'special', label: 'One special character', passed: /[^A-Za-z0-9]/.test(password) },
];

export const isStrongPassword = (password) =>
  getPasswordChecks(password).every((check) => check.passed);

const checkEmail = (email) => {
  const value = email.trim();
  if (!value) return 'Email is required';
  if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
  return '';
};

export const validateImageFile = (file) => {
  if (!file) return '';
  if (!IMAGE_TYPES.includes(file.type)) return 'Please choose a JPG, PNG, or WebP image';
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be 2 MB or smaller';
  return '';
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  const emailError = checkEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = 'Password is required';
  return errors;
};

export const validateForgotForm = ({ email }) => {
  const errors = {};
  const emailError = checkEmail(email);
  if (emailError) errors.email = emailError;
  return errors;
};

export const validateResetForm = ({ password, confirmPassword }) => {
  const errors = {};
  if (!password) errors.password = 'Password is required';
  else if (!isStrongPassword(password)) errors.password = 'Password does not meet all the requirements below';

  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export const validateRegisterForm = (values) => {
  const errors = {};

  const name = values.name.trim();
  if (!name) errors.name = 'Full name is required';
  else if (name.length < 2 || name.length > 60) errors.name = 'Name must be 2 to 60 characters';

  const emailError = checkEmail(values.email);
  if (emailError) errors.email = emailError;

  const phone = values.phone.trim();
  if (!phone) errors.phone = 'Phone number is required';
  else if (!PHONE_REGEX.test(phone)) errors.phone = 'Enter a valid phone number (7 to 20 digits, may start with +)';

  Object.assign(errors, validateResetForm(values));

  const address = values.address.trim();
  if (!address) errors.address = 'Address is required';
  else if (address.length < 5) errors.address = 'Please enter a more complete address';

  if (!values.city.trim()) errors.city = 'City is required';
  if (!values.state.trim()) errors.state = 'State is required';

  if (values.role === 'business' || values.role === 'ngo') {
    if (!values.organizationName.trim()) {
      errors.organizationName =
        values.role === 'business' ? 'Business name is required' : 'NGO name is required';
    }
  }
  if (values.role === 'business' && !values.businessType) {
    errors.businessType = 'Please choose a business type';
  }
  if (values.role === 'ngo' && values.ngoRegistrationNumber.trim()) {
    if (!NGO_REG_REGEX.test(values.ngoRegistrationNumber.trim())) {
      errors.ngoRegistrationNumber = 'Use letters, numbers, spaces, / and - (3 to 50 characters)';
    }
  }

  return errors;
};