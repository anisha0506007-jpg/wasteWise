import { Router } from 'express';

import {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordValidation,
  loginValidation,
  profileValidation,
  registerValidation,
  resetPasswordValidation,
} from '../validators/authValidators.js';

const router = Router();

// Order matters: limiter -> file upload -> validation rules -> validate -> controller
router.post('/register', authLimiter, uploadProfileImage, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfileImage, profileValidation, validate, updateProfile);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, validate, resetPassword);

// TEMPORARY test route that proves roleMiddleware works. Remove in a later phase.
router.get('/admin-check', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: `Hello admin ${req.user.name}` });
});

export default router;