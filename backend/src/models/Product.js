import mongoose from 'mongoose';

// Keep these lists identical to frontend/src/utils/productOptions.js
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
export const PRODUCT_UNITS = ['kg', 'g', 'pieces', 'packets', 'boxes', 'litres'];
export const PRODUCT_CONDITIONS = ['Fresh', 'Good', 'Near Expiry'];
export const PRODUCT_STATUSES = [
  'available',
  'partially_reserved',
  'fully_reserved',
  'collected',
  'expired',
  'unavailable',
];
// Statuses that can still receive a reservation
export const RESERVABLE_STATUSES = ['available', 'partially_reserved'];

const QUANTITY_EPSILON = 0.0001;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const requiredText = (label, max) => ({
  type: String,
  required: [true, `${label} is required`],
  trim: true,
  maxlength: [max, `${label} cannot exceed ${max} characters`],
});

const optionalText = (label, max) => ({
  type: String,
  trim: true,
  maxlength: [max, `${label} cannot exceed ${max} characters`],
  default: '',
});

const productSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: optionalText('Description', 500),
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: PRODUCT_CATEGORIES, message: 'Invalid category' },
    },
    image: { type: String, default: '' }, // public path, e.g. /uploads/product-images/<uuid>.jpg

    // ----- Quantity -----
    totalQuantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
      max: [100000, 'Quantity cannot exceed 100,000'],
    },
    // Stock that can still be requested. Reserved and collected stock are NOT in here.
    availableQuantity: { type: Number, min: [0, 'Available quantity cannot be negative'] },
    // Stock already handed over. reserved = total - available - collected
    collectedQuantity: { type: Number, default: 0, min: [0, 'Collected quantity cannot be negative'] },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: { values: PRODUCT_UNITS, message: 'Invalid unit' },
    },

    // ----- Dates -----
    manufacturingDate: Date,
    expiryDate: { type: Date, required: [true, 'Expiry date is required'] }, // exact moment
    expiryTime: {
      type: String,
      default: '',
      validate: {
        validator: (value) => !value || TIME_REGEX.test(value),
        message: 'Expiry time must look like 18:30',
      },
    },

    // ----- Pickup -----
    pickupAddress: requiredText('Pickup address', 200),
    city: requiredText('City', 60),
    state: requiredText('State', 60),
    postalCode: requiredText('Postal code', 10),
    pickupStartTime: { type: Date, required: [true, 'Pickup start time is required'] },
    pickupEndTime: { type: Date, required: [true, 'Pickup end time is required'] },
    pickupInstructions: optionalText('Pickup instructions', 300),

    // ----- Extra information -----
    condition: {
      type: String,
      required: [true, 'Product condition is required'],
      enum: { values: PRODUCT_CONDITIONS, message: 'Invalid product condition' },
    },
    storageInstructions: optionalText('Storage instructions', 300),
    dietaryInformation: optionalText('Dietary information', 200),

    status: { type: String, enum: PRODUCT_STATUSES, default: 'available' },
    isDemo: { type: Boolean, default: false }, // marks seed/test data
  },
  { timestamps: true }
);

// Indexes keep the list, dashboard and expiry-job queries fast
productSchema.index({ owner: 1, createdAt: -1 });
productSchema.index({ owner: 1, status: 1, expiryDate: 1 });
productSchema.index({ owner: 1, category: 1 });
productSchema.index({ status: 1, expiryDate: 1 }); // used by the expiry job

productSchema.pre('validate', function () {
  if (this.isNew && (this.availableQuantity === undefined || this.availableQuantity === null)) {
    this.availableQuantity = this.totalQuantity;
  }
  if (this.availableQuantity + (this.collectedQuantity || 0) > this.totalQuantity + QUANTITY_EPSILON) {
    this.invalidate(
      'availableQuantity',
      'Available and collected quantity cannot exceed the total quantity'
    );
  }
});

productSchema.methods.isExpired = function () {
  return this.expiryDate <= new Date();
};

// The single rule for "can this be donated right now?"
productSchema.methods.canBeDonated = function (requestedQuantity = 0) {
  return (
    RESERVABLE_STATUSES.includes(this.status) &&
    !this.isExpired() &&
    this.availableQuantity > QUANTITY_EPSILON &&
    requestedQuantity <= this.availableQuantity
  );
};

const Product = mongoose.model('Product', productSchema);

export default Product;