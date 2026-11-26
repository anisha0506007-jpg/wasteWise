import { getExpiryStatus } from './dateHelpers.js';

export const QUANTITY_EPSILON = 0.0001;
export const URGENT_HOURS = 24;
export const SOON_HOURS = 72;

const HOUR_MS = 60 * 60 * 1000;
const RESERVABLE = ['available', 'partially_reserved'];

// Quantities have at most 2 decimals
export const roundQty = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Stock promised to accepted requests but not yet collected
export const getReservedQuantity = (product) =>
  Math.max(
    roundQty(product.totalQuantity - product.availableQuantity - (product.collectedQuantity || 0)),
    0
  );

/**
 * The status the quantities and dates say the product should have.
 * ('unavailable' is a manual pause and is handled by the callers.)
 */
export const computeStatus = (product, now = new Date()) => {
  const collected = product.collectedQuantity || 0;
  if (collected >= product.totalQuantity - QUANTITY_EPSILON) return 'collected';
  if (new Date(product.expiryDate) <= now) return 'expired';
  if (product.availableQuantity <= QUANTITY_EPSILON) return 'fully_reserved';
  if (getReservedQuantity(product) > QUANTITY_EPSILON) return 'partially_reserved';
  return 'available';
};

// What the owner sees: the real clock always wins over a stale stored status
export const getDisplayStatus = (product, now = new Date()) => {
  if (product.status === 'collected') return 'collected';
  if (new Date(product.expiryDate) <= now) return 'expired';
  return product.status;
};

// 'expired' | 'urgent' (within 24 h) | 'soon' (within 3 days) | 'ok'
export const getExpiryLevel = (expiryDate, now = new Date()) => {
  const hoursLeft = (new Date(expiryDate) - now) / HOUR_MS;
  if (hoursLeft <= 0) return 'expired';
  if (hoursLeft <= URGENT_HOURS) return 'urgent';
  if (hoursLeft <= SOON_HOURS) return 'soon';
  return 'ok';
};

// Shapes a product for the API response (works with .lean() and aggregate results)
export const serializeProduct = (product, now = new Date()) => {
  const availableQuantity = product.availableQuantity ?? 0;
  const collectedQuantity = product.collectedQuantity || 0;
  const status = getDisplayStatus(product, now);

  return {
    id: String(product._id),
    name: product.name,
    description: product.description || '',
    category: product.category,
    image: product.image || '',
    unit: product.unit,

    totalQuantity: product.totalQuantity,
    availableQuantity,
    collectedQuantity,
    reservedQuantity: getReservedQuantity({
      totalQuantity: product.totalQuantity,
      availableQuantity,
      collectedQuantity,
    }),

    manufacturingDate: product.manufacturingDate || null,
    expiryDate: product.expiryDate,
    expiryTime: product.expiryTime || '',

    pickupAddress: product.pickupAddress,
    city: product.city,
    state: product.state,
    postalCode: product.postalCode,
    pickupStartTime: product.pickupStartTime,
    pickupEndTime: product.pickupEndTime,
    pickupInstructions: product.pickupInstructions || '',

    condition: product.condition,
    storageInstructions: product.storageInstructions || '',
    dietaryInformation: product.dietaryInformation || '',

    status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,

    expiryLevel: getExpiryLevel(product.expiryDate, now),
    expiryStatus: getExpiryStatus(product.expiryDate, now), // used by the dashboard
    canBeDonated: RESERVABLE.includes(status) && availableQuantity > QUANTITY_EPSILON,

    // Names used by the Phase 4 dashboard components
    quantity: product.totalQuantity,
    remainingQuantity: availableQuantity,
    displayStatus: status,
  };
};