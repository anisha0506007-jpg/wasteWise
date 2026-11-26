import AppError from '../utils/AppError.js';

export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Please log in to continue'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action'));
    }
    next();
  };