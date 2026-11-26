import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';

export const logActivity = async ({ business, type, message, product, request }) => {
  try {
    await Activity.create({ business, type, message, product, request });
  } catch (error) {
    console.error(`⚠️ Could not log activity: ${error.message}`);
  }
};

export const notifyUser = async ({ user, type = 'system', title, message, link = '' }) => {
  try {
    await Notification.create({ user, type, title, message, link });
  } catch (error) {
    console.error(`⚠️ Could not create notification: ${error.message}`);
  }
};