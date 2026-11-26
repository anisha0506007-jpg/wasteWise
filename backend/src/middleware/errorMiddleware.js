import { removeUploadedFile } from './uploadMiddleware.js';

const UPLOAD_LIMIT_MESSAGES = {
  productImage: 'Product image must be 5 MB or smaller',
  profileImage: 'Profile image must be 2 MB or smaller',
};

/**
 * Runs when no route matches the request.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central error handler. Every error ends up here and becomes clean JSON.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // If a photo was uploaded but the request failed, delete the photo
  if (req.file) removeUploadedFile(req.file);

  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Something went wrong on the server';
  let errors = err.errors;

  // Mongoose schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Please fix the highlighted fields';
    errors = Object.fromEntries(
      Object.entries(err.errors || {}).map(([field, e]) => [field, e.message])
    );
  }

  // Duplicate unique value (e.g. email) caught by MongoDB's unique index
  if (err.code === 11000) {
    statusCode = 409;
    message = 'An account with this email already exists';
    errors = { email: message };
  }

  // Bad MongoDB id format
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
  }

  // Upload problems (e.g. file too large)
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = UPLOAD_LIMIT_MESSAGES[err.field] || 'The uploaded file is too large';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    } else {
      message = 'Invalid file upload';
    }
    errors = err.field ? { [err.field]: message } : undefined;
  }

  // Broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Never leak internal error details in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong on the server';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};