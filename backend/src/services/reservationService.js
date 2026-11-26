import mongoose from 'mongoose';

import Product, { RESERVABLE_STATUSES } from '../models/Product.js';
import AppError from '../utils/AppError.js';
import { QUANTITY_EPSILON, computeStatus } from '../utils/productHelpers.js';

const parseQuantity = (value) => {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new AppError(400, 'Quantity must be greater than 0');
  }
  return quantity;
};

/**
 * Recalculates and saves the status after a stock change.
 * It only writes if the status is still what we read (compare-and-set), so a slower
 * concurrent call can never overwrite a newer status with an older one.
 * A manual "unavailable" pause is kept unless the product is collected or expired.
 */
export const syncProductStatus = async (productId, { session } = {}) => {
  const product = await Product.findById(productId).session(session || null).lean();
  if (!product) return null;

  let next = computeStatus(product);
  if (product.status === 'unavailable' && next !== 'collected' && next !== 'expired') {
    next = 'unavailable';
  }

  if (next !== product.status) {
    await Product.updateOne(
      { _id: productId, status: product.status },
      { $set: { status: next } },
      { session }
    );
  }
  return next;
};

const explainReserveFailure = async (productId, quantity, session) => {
  const product = await Product.findById(productId).session(session || null).lean();
  if (!product) return new AppError(404, 'Product not found');
  if (new Date(product.expiryDate) <= new Date()) {
    return new AppError(400, 'Expired products cannot be donated');
  }
  if (product.status === 'unavailable') {
    return new AppError(409, 'This listing is currently unavailable');
  }
  if (product.status === 'collected' || product.availableQuantity <= QUANTITY_EPSILON) {
    return new AppError(409, 'This product has no quantity left to request');
  }
  if (product.availableQuantity < quantity) {
    return new AppError(409, `Only ${product.availableQuantity} ${product.unit} available`);
  }
  return new AppError(409, 'This product cannot be reserved right now');
};

/**
 * Called when a business ACCEPTS a request: moves stock from "available" to "reserved".
 * The condition and the subtraction happen in ONE atomic step, so available stock can
 * never go below zero, even with many simultaneous accepts.
 */
export const reserveQuantity = async (productId, quantity, { session } = {}) => {
  const qty = parseQuantity(quantity);

  const updated = await Product.findOneAndUpdate(
    {
      _id: productId,
      status: { $in: RESERVABLE_STATUSES },
      expiryDate: { $gt: new Date() }, // real clock check, independent of the expiry job
      availableQuantity: { $gte: qty },
    },
    { $inc: { availableQuantity: -qty } },
    { new: true, session }
  );

  if (!updated) throw await explainReserveFailure(productId, qty, session);

  await syncProductStatus(updated._id, { session });
  return Product.findById(updated._id).session(session || null);
};

/**
 * Called when an ACCEPTED request is cancelled: gives reserved stock back.
 * Cannot release more than is actually reserved.
 */
export const releaseQuantity = async (productId, quantity, { session } = {}) => {
  const qty = parseQuantity(quantity);

  const updated = await Product.findOneAndUpdate(
    {
      _id: productId,
      // available + collected + qty must not exceed total (i.e. qty <= reserved)
      $expr: {
        $lte: [{ $add: ['$availableQuantity', '$collectedQuantity', qty] }, '$totalQuantity'],
      },
    },
    { $inc: { availableQuantity: qty } },
    { new: true, session }
  );

  if (!updated) throw new AppError(409, 'Cannot release more stock than is currently reserved');

  await syncProductStatus(updated._id, { session });
  return Product.findById(updated._id).session(session || null);
};

/**
 * Called when a reserved request is COLLECTED: moves stock from "reserved" to "collected".
 * totalQuantity never changes.
 */
export const confirmCollection = async (productId, quantity, { session } = {}) => {
  const qty = parseQuantity(quantity);

  const updated = await Product.findOneAndUpdate(
    {
      _id: productId,
      expiryDate: { $gt: new Date() },
      // reserved (total - available - collected) must be at least qty
      $expr: {
        $gte: [
          { $subtract: [{ $subtract: ['$totalQuantity', '$availableQuantity'] }, '$collectedQuantity'] },
          qty,
        ],
      },
    },
    { $inc: { collectedQuantity: qty } },
    { new: true, session }
  );

  if (!updated) {
    throw new AppError(409, 'This quantity is not reserved, or the product has expired');
  }

  await syncProductStatus(updated._id, { session });
  return Product.findById(updated._id).session(session || null);
};

/**
 * Runs `work(session)` inside a MongoDB transaction when the database supports it
 * (Atlas and replica sets do). A standalone local MongoDB does not, so we fall back to
 * running without one. Use it whenever two collections must change together
 * (for example: request status + product stock).
 */
export const runInTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    const unsupported =
      error?.code === 20 || /replica set|Transaction numbers/i.test(error?.message || '');
    if (unsupported) return work(undefined);
    throw error;
  } finally {
    await session.endSession();
  }
};