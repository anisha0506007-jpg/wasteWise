import AppError from './AppError.js';
import { QUANTITY_EPSILON, roundQty } from './productHelpers.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * body      - validated request body (express-validator already checked the formats)
 * existing  - the current product when editing, otherwise null
 * unitLocked- true when requests exist, so the unit can no longer change
 * Throws AppError(400, ..., { field: message }) if a cross-field rule fails.
 */
export const buildProductData = (body, existing = null, { unitLocked = false } = {}) => {
  const errors = {};
  const now = new Date();
  const str = (key) => (typeof body[key] === 'string' ? body[key].trim() : '');

  const data = {
    name: str('name'),
    description: str('description'),
    category: str('category'),
    unit: str('unit'),
    totalQuantity: roundQty(str('totalQuantity')),
    manufacturingDate: str('manufacturingDate') ? new Date(str('manufacturingDate')) : null,
    expiryDate: new Date(str('expiryDate')),
    expiryTime: str('expiryTime'),
    pickupAddress: str('pickupAddress'),
    city: str('city'),
    state: str('state'),
    postalCode: str('postalCode'),
    pickupStartTime: new Date(str('pickupStartTime')),
    pickupEndTime: new Date(str('pickupEndTime')),
    pickupInstructions: str('pickupInstructions'),
    condition: str('condition'),
    storageInstructions: str('storageInstructions'),
    dietaryInformation: str('dietaryInformation'),
  };

  // On edit, "must be in the future" only applies to values that were actually changed
  const expiryChanged =
    !existing || Math.abs(data.expiryDate - new Date(existing.expiryDate)) >= MINUTE_MS;
  const pickupEndChanged =
    !existing || Math.abs(data.pickupEndTime - new Date(existing.pickupEndTime)) >= MINUTE_MS;

  // ----- Expiry -----
  if (expiryChanged && data.expiryDate <= now) {
    errors.expiryDate = 'Expiry date and time must be in the future';
  }

  // ----- Manufacturing date -----
  if (data.manufacturingDate) {
    if (data.manufacturingDate.getTime() > now.getTime() + DAY_MS) {
      errors.manufacturingDate = 'Manufacturing date cannot be in the future';
    } else if (data.manufacturingDate > data.expiryDate) {
      errors.manufacturingDate = 'Manufacturing date must be before the expiry date';
    }
  }

  // ----- Pickup window -----
  if (data.pickupEndTime <= data.pickupStartTime) {
    errors.pickupEndTime = 'Pickup end time must be after the start time';
  } else if (pickupEndChanged && data.pickupEndTime <= now) {
    errors.pickupEndTime = 'Pickup end time must be in the future';
  } else if (data.pickupEndTime > data.expiryDate) {
    errors.pickupEndTime = 'Pickup must end before the product expires';
  }

  // ----- Quantity and unit (edit only) -----
  if (existing) {
    // Stock already reserved or collected cannot be taken away by editing
    const committed = roundQty(existing.totalQuantity - existing.availableQuantity);

    if (data.totalQuantity < committed - QUANTITY_EPSILON) {
      errors.totalQuantity = `Cannot be lower than ${committed} ${existing.unit} (already reserved or collected)`;
    } else {
      data.availableQuantity = roundQty(data.totalQuantity - committed);
    }

    if (data.unit !== existing.unit && (committed > 0 || unitLocked)) {
      errors.unit = 'The unit cannot be changed once requests or reservations exist';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(400, 'Please fix the highlighted fields', errors);
  }

  return data;
};