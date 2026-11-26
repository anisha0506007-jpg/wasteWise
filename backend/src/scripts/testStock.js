import 'dotenv/config';
import mongoose from 'mongoose';

import DonationRequest from '../models/DonationRequest.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { expireDueProducts } from '../services/expiryService.js';
import {
  confirmCollection,
  releaseQuantity,
  reserveQuantity,
} from '../services/reservationService.js';
import { computeStatus } from '../utils/productHelpers.js';

// Usage (inside backend/):  npm run test:stock -- biz@test.com

const email = process.argv.slice(2).find((arg) => !arg.startsWith('--'))?.trim().toLowerCase();
const hours = (n) => new Date(Date.now() + n * 3600 * 1000);

let failures = 0;
const check = (label, passed, extra = '') => {
  console.log(`${passed ? '✅' : '❌'} ${label}${extra ? `  (${extra})` : ''}`);
  if (!passed) failures += 1;
};
const errorOf = async (promise) => {
  try {
    await promise;
    return null;
  } catch (error) {
    return error;
  }
};
const fresh = (id) => Product.findById(id).lean();

const makeProduct = (business, overrides = {}) =>
  Product.create({
    owner: business._id,
    name: 'STOCK TEST',
    category: 'Other',
    totalQuantity: 10,
    unit: 'kg',
    expiryDate: hours(48),
    pickupAddress: business.address || 'Test address',
    city: business.city || 'Test city',
    state: business.state || 'Test state',
    postalCode: '110001',
    pickupStartTime: hours(0),
    pickupEndTime: hours(24),
    condition: 'Fresh',
    isDemo: true,
    ...overrides,
  });

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Refusing to run in production.');
    process.exit(1);
  }
  if (!process.env.MONGO_URI || !email) {
    console.error('Usage: npm run test:stock -- <business-email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const business = await User.findOne({ email, role: 'business' });
  if (!business) {
    console.error(`❌ No BUSINESS account found with the email ${email}.`);
    process.exitCode = 1;
    await mongoose.disconnect();
    return;
  }

  try {
    console.log('\n--- Reserving stock ---');
    const product = await makeProduct(business); // 10 kg
    let p = await reserveQuantity(product._id, 4);
    check('Reserve 4 of 10 leaves 6 available', p.availableQuantity === 6);
    check('Status becomes partially_reserved', p.status === 'partially_reserved');

    let error = await errorOf(reserveQuantity(product._id, 7));
    check('Reserving 7 when only 6 are left is rejected', error?.statusCode === 409, error?.message);
    check('Stock is unchanged after the rejection', (await fresh(product._id)).availableQuantity === 6);

    error = await errorOf(reserveQuantity(product._id, -2));
    check('A negative quantity is rejected', error?.statusCode === 400, error?.message);

    console.log('\n--- 5 simultaneous requests of 3 kg (only 2 can fit in 6 kg) ---');
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () => reserveQuantity(product._id, 3))
    );
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    p = await fresh(product._id);
    check('Exactly 2 of the 5 succeed', succeeded === 2, `${succeeded} succeeded`);
    check('Available stock is exactly 0 and never negative', p.availableQuantity === 0, `available = ${p.availableQuantity}`);
    check('Status becomes fully_reserved', p.status === 'fully_reserved', p.status);

    error = await errorOf(reserveQuantity(product._id, 1));
    check('A fully reserved product accepts no new reservation', error?.statusCode === 409, error?.message);

    console.log('\n--- Releasing and collecting ---');
    p = await releaseQuantity(product._id, 3);
    check('Releasing 3 gives 3 back and status partially_reserved', p.availableQuantity === 3 && p.status === 'partially_reserved');

    error = await errorOf(releaseQuantity(product._id, 50));
    check('Releasing more than is reserved is rejected', error?.statusCode === 409, error?.message);

    p = await confirmCollection(product._id, 4);
    check('Collecting 4 moves it from reserved to collected', p.collectedQuantity === 4 && p.availableQuantity === 3);
    check('Total quantity never changes', p.totalQuantity === 10);

    error = await errorOf(confirmCollection(product._id, 50));
    check('Collecting more than is reserved is rejected', error?.statusCode === 409, error?.message);

    console.log('\n--- Expiry rules ---');
    const stale = await makeProduct(business, { expiryDate: hours(-1) }); // expired, but status still "available"
    error = await errorOf(reserveQuantity(stale._id, 1));
    check('An expired product cannot be reserved', error?.statusCode === 400 && /Expired/.test(error.message), error?.message);

    error = await errorOf(
      new DonationRequest({
        product: stale._id,
        business: business._id,
        requester: business._id,
        requestedQuantity: 1,
        isDemo: true,
      }).save()
    );
    check('A donation request for an expired product is rejected', /Expired/.test(error?.message || ''), error?.message);

    const expiredCount = await expireDueProducts({ owner: business._id });
    check('The expiry job marks the stale product as expired', expiredCount >= 1 && (await fresh(stale._id)).status === 'expired');

    const live = await makeProduct(business);
    check('A normal product computes as "available"', computeStatus(live) === 'available');
  } finally {
    await Product.deleteMany({ owner: business._id, name: 'STOCK TEST', isDemo: true });
    await mongoose.disconnect();
  }

  console.log(failures === 0 ? '\n🎉 All checks passed.' : `\n⚠️  ${failures} check(s) failed.`);
  process.exitCode = failures === 0 ? 0 : 1;
};

run().catch((error) => {
  console.error(`❌ Test script crashed: ${error.message}`);
  process.exit(1);
});