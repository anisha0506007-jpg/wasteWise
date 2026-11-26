import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { AUTH_COOKIE_NAME, clearAuthCookie } from '../utils/token.js';
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    throw new AppError(401, 'Please log in to continue');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    clearAuthCookie(res); // remove the useless cookie
    if (error.name === 'TokenExpiredError') {
      throw new AppError(401, 'Your session has expired. Please log in again.');
    }
    throw new AppError(401, 'Invalid authentication token. Please log in again.');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    clearAuthCookie(res);
    throw new AppError(401, 'This account no longer exists');
  }

  if (!user.isActive) {
    clearAuthCookie(res);
    throw new AppError(403, 'This account has been deactivated. Please contact support.');
  }

  // If the password changed after this token was issued, the token is no longer valid.
  if (
    user.passwordChangedAt &&
    decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    clearAuthCookie(res);
    throw new AppError(401, 'Your password was changed. Please log in again.');
  }

  req.user = user;
  next();
});