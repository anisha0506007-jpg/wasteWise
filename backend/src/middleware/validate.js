import { validationResult } from 'express-validator';

import { removeUploadedFile } from './uploadMiddleware.js';

export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  removeUploadedFile(req.file);

  const errors = {};
  Object.entries(result.mapped()).forEach(([field, error]) => {
    errors[field] = error.msg;
  });

  return res.status(400).json({
    success: false,
    message: 'Please fix the highlighted fields',
    errors,
  });
};