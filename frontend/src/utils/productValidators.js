import { toDateInput } from './productFormat.js';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const QUANTITY_REGEX = /^\d{1,6}(\.\d{1,2})?$/;
const POSTAL_REGEX = /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/;
const MINUTE_MS = 60 * 1000;

export const validateProductImage = (file) => {
  if (!file) return '';
  if (!IMAGE_TYPES.includes(file.type)) return 'Please choose a JPG, PNG, or WebP image';
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be 5 MB or smaller';
  return '';
};

// Builds a Date from the date + optional time inputs (no time means end of day)
export const parseLocalDateTime = (date, time) => {
  if (!date) return null;
  const result = new Date(`${date}T${time || '23:59'}`);
  return Number.isNaN(result.getTime()) ? null : result;
};

/**
 * values   - form values
 * original - the existing product when editing (so unchanged past dates are allowed)
 */
export const validateProductForm = (values, { original = null } = {}) => {
  const errors = {};
  const now = new Date();

  const name = values.name.trim();
  if (!name) errors.name = 'Product name is required';
  else if (name.length < 2 || name.length > 100) errors.name = 'Product name must be 2 to 100 characters';

  if (values.description.trim().length > 500) errors.description = 'Description cannot exceed 500 characters';
  if (!values.category) errors.category = 'Please choose a category';
  if (!values.unit) errors.unit = 'Please choose a unit';

  // ----- Quantity -----
  const quantity = values.totalQuantity.trim();
  if (!quantity) errors.totalQuantity = 'Quantity is required';
  else if (!QUANTITY_REGEX.test(quantity)) errors.totalQuantity = 'Enter a number with up to 2 decimal places';
  else {
    const number = Number(quantity);
    if (number <= 0) errors.totalQuantity = 'Quantity must be greater than 0';
    else if (number > 100000) errors.totalQuantity = 'Quantity cannot exceed 100,000';
    else if (original) {
      const committed = Math.round((original.totalQuantity - original.availableQuantity) * 100) / 100;
      if (number < committed) {
        errors.totalQuantity = `Cannot be lower than ${committed} ${original.unit} (already reserved or collected)`;
      }
    }
  }

  // ----- Expiry -----
  const expiry = parseLocalDateTime(values.expiryDate, values.expiryTime);
  if (!values.expiryDate) errors.expiryDate = 'Expiry date is required';
  else if (!expiry) errors.expiryDate = 'Enter a valid expiry date';
  else {
    const changed = !original || Math.abs(expiry - new Date(original.expiryDate)) >= MINUTE_MS;
    if (changed && expiry <= now) errors.expiryDate = 'Expiry date and time must be in the future';
  }

  if (values.manufacturingDate) {
    if (values.manufacturingDate > toDateInput(now)) {
      errors.manufacturingDate = 'Manufacturing date cannot be in the future';
    } else if (values.expiryDate && values.manufacturingDate > values.expiryDate) {
      errors.manufacturingDate = 'Manufacturing date must be before the expiry date';
    }
  }

  // ----- Pickup -----
  const address = values.pickupAddress.trim();
  if (!address) errors.pickupAddress = 'Pickup address is required';
  else if (address.length < 5) errors.pickupAddress = 'Please enter a more complete address';
  if (!values.city.trim()) errors.city = 'City is required';
  if (!values.state.trim()) errors.state = 'State is required';
  if (!values.postalCode.trim()) errors.postalCode = 'Postal code is required';
  else if (!POSTAL_REGEX.test(values.postalCode.trim())) {
    errors.postalCode = 'Enter a valid postal code (3 to 10 letters or numbers)';
  }

  const start = values.pickupStartTime ? new Date(values.pickupStartTime) : null;
  const end = values.pickupEndTime ? new Date(values.pickupEndTime) : null;
  if (!start || Number.isNaN(start.getTime())) errors.pickupStartTime = 'Pickup start time is required';
  if (!end || Number.isNaN(end.getTime())) errors.pickupEndTime = 'Pickup end time is required';

  if (!errors.pickupStartTime && !errors.pickupEndTime) {
    const endChanged = !original || Math.abs(end - new Date(original.pickupEndTime)) >= MINUTE_MS;
    if (end <= start) errors.pickupEndTime = 'Pickup end time must be after the start time';
    else if (endChanged && end <= now) errors.pickupEndTime = 'Pickup end time must be in the future';
    else if (expiry && !errors.expiryDate && end > expiry) {
      errors.pickupEndTime = 'Pickup must end before the product expires';
    }
  }
  if (values.pickupInstructions.trim().length > 300) {
    errors.pickupInstructions = 'Instructions cannot exceed 300 characters';
  }

  // ----- Additional -----
  if (!values.condition) errors.condition = 'Please choose the product condition';
  if (values.storageInstructions.trim().length > 300) {
    errors.storageInstructions = 'Storage instructions cannot exceed 300 characters';
  }
  if (values.dietaryInformation.trim().length > 200) {
    errors.dietaryInformation = 'Dietary information cannot exceed 200 characters';
  }

  if (!values.confirmed) {
    errors.confirmed = 'Please confirm the product information is accurate and safe for donation';
  }

  return errors;
};