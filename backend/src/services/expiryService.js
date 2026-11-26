import DonationRequest from '../models/DonationRequest.js';
import Product from '../models/Product.js';

// Fully collected products ('collected') are finished and never expire
const EXPIRABLE_STATUSES = ['available', 'partially_reserved', 'fully_reserved', 'unavailable'];

/**
 * Marks every product whose expiry moment has passed as "expired" and rejects its
 * pending requests. Safe to run often and from several servers: it is idempotent.
 * Pass { owner } to limit it to one business.
 */
export const expireDueProducts = async ({ owner } = {}) => {
  const now = new Date();
  const filter = {
    status: { $in: EXPIRABLE_STATUSES },
    expiryDate: { $lte: now },
    ...(owner && { owner }),
  };

  const due = await Product.find(filter).select('_id').lean();
  if (due.length === 0) return 0;

  const ids = due.map((product) => product._id);

  const result = await Product.updateMany(
    { _id: { $in: ids }, status: { $in: EXPIRABLE_STATUSES } },
    { $set: { status: 'expired' } }
  );

  // Nobody can collect expired food, so open requests for it are closed
  await DonationRequest.updateMany(
    { product: { $in: ids }, status: 'pending' },
    { $set: { status: 'rejected', respondedAt: now } }
  );

  return result.modifiedCount;
};

// Runs once at startup, then every few minutes
export const startExpiryJob = (intervalMs = 5 * 60 * 1000) => {
  const run = async () => {
    try {
      const count = await expireDueProducts();
      if (count > 0) console.log(`⏰ Marked ${count} product(s) as expired`);
    } catch (error) {
      console.error(`⚠️ Expiry job failed: ${error.message}`);
    }
  };

  run();
  const timer = setInterval(run, intervalMs);
  timer.unref(); // does not keep the process alive on its own
  return timer;
};