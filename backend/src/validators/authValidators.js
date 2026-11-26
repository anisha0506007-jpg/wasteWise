import { body } from 'express-validator';

import { BUSINESS_TYPES, PUBLIC_ROLES } from '../models/User.js';

// Keep these two patterns identical to frontend/src/utils/validators.js
const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;
const NGO_REG_REGEX = new RegExp('^[A-Za-z0-9/ -]{3,50}$');

// Builds: trim -> required -> length. `condition` makes the rule apply only sometimes.
const requiredText = (field, label, { min = 2, max = 100 } = {}, condition) => {
  let chain = body(field);
  if (condition) chain = chain.if(condition);
  return chain
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .bail()
    .isLength({ min, max })
    .withMessage(`${label} must be ${min} to ${max} characters`);
};

const emailRule = () =>
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .bail()
    .isLength({ max: 254 })
    .withMessage('Email is too long');

// Passwords are never trimmed. Max 64 also stays inside bcrypt's 72-byte limit.
const passwordRule = (field = 'password') =>
  body(field)
    .isString()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be 8 to 64 characters long')
    .bail()
    .matches(/[a-z]/)
    .withMessage('Password must include a lowercase letter')
    .bail()
    .matches(/[A-Z]/)
    .withMessage('Password must include an uppercase letter')
    .bail()
    .matches(/\d/)
    .withMessage('Password must include a number')
    .bail()
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must include a special character');

const confirmPasswordRule = () =>
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .bail()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match');

const phoneRule = (optional = false) => {
  let chain = body('phone');
  if (optional) chain = chain.optional();
  return chain
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .bail()
    .matches(PHONE_REGEX)
    .withMessage('Enter a valid phone number (7 to 20 digits, may start with +)');
};

export const registerValidation = [
  requiredText('name', 'Full name', { max: 60 }),
  emailRule(),
  passwordRule('password'),
  confirmPasswordRule(),
  phoneRule(),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Please select an account type')
    .bail()
    .isIn(PUBLIC_ROLES) // "admin" (or anything else) is rejected here
    .withMessage('Invalid account type'),
  requiredText('address', 'Address', { min: 5, max: 200 }),
  requiredText('city', 'City', { max: 60 }),
  requiredText('state', 'State', { max: 60 }),

  // Business and NGO only
  requiredText(
    'organizationName',
    'Organization name',
    { max: 100 },
    body('role').isIn(['business', 'ngo'])
  ),

  // Business only
  body('businessType')
    .if(body('role').equals('business'))
    .trim()
    .notEmpty()
    .withMessage('Please choose a business type')
    .bail()
    .isIn(BUSINESS_TYPES)
    .withMessage('Invalid business type'),

  // NGO only (optional)
  body('ngoRegistrationNumber')
    .if(body('role').equals('ngo'))
    .optional({ values: 'falsy' })
    .trim()
    .matches(NGO_REG_REGEX)
    .withMessage('Registration number can use letters, numbers, spaces, / and - (3 to 50 characters)'),
];

export const loginValidation = [
  emailRule(),
  body('password')
    .isString()
    .withMessage('Password is required')
    .bail()
    .notEmpty()
    .withMessage('Password is required'),
  body('rememberMe').optional().toBoolean(),
];

// Profile: every field is optional, but if sent it must be valid. Email, role and
// password cannot be changed here.
export const profileValidation = [
  requiredText('name', 'Full name', { max: 60 }).optional(),
  phoneRule(true),
  requiredText('address', 'Address', { min: 5, max: 200 }).optional(),
  requiredText('city', 'City', { max: 60 }).optional(),
  requiredText('state', 'State', { max: 60 }).optional(),
  requiredText('organizationName', 'Organization name', { max: 100 }).optional(),
  body('businessType')
    .optional()
    .trim()
    .isIn(BUSINESS_TYPES)
    .withMessage('Invalid business type'),
  body('ngoRegistrationNumber')
    .optional({ values: 'falsy' })
    .trim()
    .matches(NGO_REG_REGEX)
    .withMessage('Registration number can use letters, numbers, spaces, / and - (3 to 50 characters)'),
];

export const forgotPasswordValidation = [emailRule()];

export const resetPasswordValidation = [
  body('token')
    .isString()
    .withMessage('Reset token is required')
    .bail()
    .isHexadecimal()
    .isLength({ min: 64, max: 64 })
    .withMessage('This reset link is invalid'),
  passwordRule('password'),
  confirmPasswordRule(),
];