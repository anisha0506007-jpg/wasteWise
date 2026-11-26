import mongoose from 'mongoose';

import AppError from '../utils/AppError.js';
import Product from './Product.js';

export const REQUEST_STATUSES = ['pending', 'accepted', 'collected', 'rejected'];

const donationRequestSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    // The product owner is copied here so dashboard queries need no join
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedQuantity: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: [0.01, 'Requested quantity must be greater than 0'],
    },
    message: { type: String, trim: true, maxlength: 300, default: '' },
    status: { type: String, enum: REQUEST_STATUSES, default: 'pending' },
    respondedAt: Date,
    collectedAt: Date,
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

donationRequestSchema.index({ business: 1, createdAt: -1 });
donationRequestSchema.index({ business: 1, status: 1, collectedAt: 1 });
donationRequestSchema.index({ product: 1, status: 1 });

// Runs when a NEW request is created. Protects every future controller:
// expired, unavailable, out-of-stock, or someone else's products cannot be requested.
// Note: a pending request does NOT reduce stock. Stock is reserved only on acceptance.
donationRequestSchema.pre('validate', async function () {
  if (!this.isNew || this.$locals.skipChecks) return; // skipChecks is only used by the seed script

  const product = await Product.findById(this.product);
  if (!product) throw new AppError(404, 'Product not found');
  if (String(product.owner) !== String(this.business)) {
    throw new AppError(400, 'This product does not belong to the selected business');
  }
  if (product.isExpired()) throw new AppError(400, 'Expired products cannot be donated');
  if (!product.canBeDonated(this.requestedQuantity)) {
    throw new AppError(400, 'This product is not available in the requested quantity');
  }
});

const DonationRequest = mongoose.model('DonationRequest', donationRequestSchema);

export default DonationRequest;