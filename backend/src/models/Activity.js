import mongoose from 'mongoose';

export const ACTIVITY_TYPES = [
  'product_listed',
  'product_updated',
  'request_received',
  'request_accepted',
  'request_rejected',
  'product_collected',
];

const activitySchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    message: { type: String, required: true, trim: true, maxlength: 200 },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'DonationRequest' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

activitySchema.index({ business: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;