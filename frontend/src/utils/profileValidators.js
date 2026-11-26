// Keep these patterns identical to the backend validators
const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;
const BUSINESS_TYPES = ['Restaurant', 'Bakery', 'Grocery Store', 'Hotel', 'Supermarket', 'Other'];

export const validateBusinessProfile = (values) => {
  const errors = {};

  const name = values.name.trim();
  if (!name) errors.name = 'Owner name is required';
  else if (name.length < 2 || name.length > 60) errors.name = 'Name must be 2 to 60 characters';

  const organization = values.organizationName.trim();
  if (!organization) errors.organizationName = 'Business name is required';
  else if (organization.length < 2 || organization.length > 100) {
    errors.organizationName = 'Business name must be 2 to 100 characters';
  }

  if (!BUSINESS_TYPES.includes(values.businessType)) {
    errors.businessType = 'Please choose a business type';
  }

  const phone = values.phone.trim();
  if (!phone) errors.phone = 'Phone number is required';
  else if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Enter a valid phone number (7 to 20 digits, may start with +)';
  }

  const address = values.address.trim();
  if (!address) errors.address = 'Address is required';
  else if (address.length < 5) errors.address = 'Please enter a more complete address';

  if (!values.city.trim()) errors.city = 'City is required';
  if (!values.state.trim()) errors.state = 'State is required';

  return errors;
};