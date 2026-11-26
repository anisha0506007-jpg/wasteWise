import { Router } from 'express';

import { updateProfile } from '../controllers/authController.js';
import {
  getActivity,
  getAnalytics,
  getDashboard,
  getExpiryAlerts,
  getNotifications,
  getProfile,
  getRecentProducts,
  getRecentRequests,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/businessController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import { profileValidation } from '../validators/authValidators.js';

const router = Router();

// Everything below requires: a valid login cookie AND the "business" role
router.use(protect, authorize('business'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/recent-products', getRecentProducts);
router.get('/recent-requests', getRecentRequests);
router.get('/expiry-alerts', getExpiryAlerts);
router.get('/activity', getActivity);

router.get('/profile', getProfile);
router.put('/profile', uploadProfileImage, profileValidation, validate, updateProfile);

router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead); // must stay above /:id
router.put('/notifications/:id/read', markNotificationRead);

export default router;