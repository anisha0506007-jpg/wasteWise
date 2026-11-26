import { body, param, query } from 'express-validator';

import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  PRODUCT_STATUSES,
  PRODUCT_UNITS,
} from '../models/Product.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const QUANTITY_REGEX = /^\d{1,6}(\.\d{1,2})?$/;
const POSTAL_REGEX = /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/;

const text = (field, label, { min = 0, max, required = false } = {}) => {
  let chain = body(field);
  if (!required) chain = chain.optional({ values: 'falsy' });
  if (required) chain = chain.exists({ values: 'falsy' }).withMessage(`${label} is required`).bail();
  chain = chain.isString().withMessage(`${label} is invalid`).bail().trim();
  if (required) chain = chain.notEmpty().withMessage(`${label} is required`).bail();
  return chain
    .isLength({ min, max })
    .withMessage(`${label} must be ${min ? `${min} to ` : 'up to '}${max} characters`);
};

const choice = (field, label, list) =>
  body(field)
    .exists({ values: 'falsy' })
    .withMessage(`Please choose ${label}`)
    .bail()
    .isString()
    .isIn(list)
    .withMessage(`Invalid ${label}`);

// Used for both creating and editing (an edit sends the complete form again)
export const productValidation = [
  text('name', 'Product name', { min: 2, max: 100, required: true }),
  text('description', 'Description', { max: 500 }),
  choice('category', 'a category', PRODUCT_CATEGORIES),

  body('totalQuantity')
    .exists({ values: 'falsy' })
    .withMessage('Quantity is required')
    .bail()
    .isString()
    .trim()
    .matches(QUANTITY_REGEX)
    .withMessage('Enter a number with up to 2 decimal places')
    .bail()
    .custom((value) => Number(value) > 0)
    .withMessage('Quantity must be greater than 0')
    .bail()
    .custom((value) => Number(value) <= 100000)
    .withMessage('Quantity cannot exceed 100,000'),
  choice('unit', 'a unit', PRODUCT_UNITS),

  body('manufacturingDate')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .matches(DATE_REGEX)
    .isISO8601({ strict: true })
    .withMessage('Enter a valid manufacturing date'),
  body('expiryDate')
    .exists({ values: 'falsy' })
    .withMessage('Expiry date is required')
    .bail()
    .isString()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Enter a valid expiry date'),
  body('expiryTime')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .matches(TIME_REGEX)
    .withMessage('Expiry time must look like 18:30'),

  text('pickupAddress', 'Pickup address', { min: 5, max: 200, required: true }),
  text('city', 'City', { min: 2, max: 60, required: true }),
  text('state', 'State', { min: 2, max: 60, required: true }),
  body('postalCode')
    .exists({ values: 'falsy' })
    .withMessage('Postal code is required')
    .bail()
    .isString()
    .trim()
    .matches(POSTAL_REGEX)
    .withMessage('Enter a valid postal code (3 to 10 letters or numbers)'),
  body('pickupStartTime')
    .exists({ values: 'falsy' })
    .withMessage('Pickup start time is required')
    .bail()
    .isString()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Enter a valid pickup start time'),
  body('pickupEndTime')
    .exists({ values: 'falsy' })
    .withMessage('Pickup end time is required')
    .bail()
    .isString()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Enter a valid pickup end time'),
  text('pickupInstructions', 'Pickup instructions', { max: 300 }),

  choice('condition', 'the product condition', PRODUCT_CONDITIONS),
  text('storageInstructions', 'Storage instructions', { max: 300 }),
  text('dietaryInformation', 'Dietary information', { max: 200 }),

  body('confirmed')
    .custom((value) => value === 'true' || value === true)
    .withMessage('Please confirm the product information is accurate and safe for donation'),
];

export const idValidation = [param('id').isMongoId().withMessage('Invalid product id')];

// Only these two can be set by hand. The other statuses are automatic.
export const statusValidation = [
  body('status')
    .isIn(['available', 'unavailable'])
    .withMessage('Status must be "available" or "unavailable"'),
];

export const listProductsValidation = [
  query('search').optional({ values: 'falsy' }).isString().isLength({ max: 100 }).withMessage('Search is too long'),
  query('category').optional({ values: 'falsy' }).isIn(PRODUCT_CATEGORIES).withMessage('Invalid category'),
  query('status').optional({ values: 'falsy' }).isIn(PRODUCT_STATUSES).withMessage('Invalid status'),
  query('sort')
    .optional({ values: 'falsy' })
    .isIn(['newest', 'oldest', 'expiry_asc', 'expiry_desc'])
    .withMessage('Invalid sort option'),
];