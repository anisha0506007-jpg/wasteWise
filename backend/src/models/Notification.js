import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = ['request', 'expiry', 'donation', 'system'];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: 'system' },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    link: { type: String, trim: true, default: '' }, // internal path, e.g. /business/requests
    isRead: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;