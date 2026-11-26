// Keep these lists identical to backend/src/models/Product.js
export const PRODUCT_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Bakery',
  'Dairy',
  'Packaged Food',
  'Cooked Food',
  'Beverages',
  'Grocery',
  'Other',
];

export const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'packets', label: 'Packets' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'litres', label: 'Litres' },
];

export const CONDITION_OPTIONS = ['Fresh', 'Good', 'Near Expiry'];

export const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'partially_reserved', label: 'Partially Reserved' },
  { value: 'fully_reserved', label: 'Fully Reserved' },
  { value: 'collected', label: 'Collected' },
  { value: 'expired', label: 'Expired' },
  { value: 'unavailable', label: 'Unavailable' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'expiry_asc', label: 'Expiry: soonest first' },
  { value: 'expiry_desc', label: 'Expiry: latest first' },
];

export const PAGE_SIZE = 9;