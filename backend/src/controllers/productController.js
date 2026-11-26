import DonationRequest from '../models/DonationRequest.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logActivity, notifyUser } from '../utils/activityLogger.js';
import { buildPagination, parsePagination } from '../utils/pagination.js';
import { buildProductData } from '../utils/productInput.js';
import {
  QUANTITY_EPSILON,
  computeStatus,
  getReservedQuantity,
  serializeProduct,
} from '../utils/productHelpers.js';
import { expireDueProducts } from '../services/expiryService.js';
import { runInTransaction } from '../services/reservationService.js';
import { PRODUCT_IMAGE_URL_PREFIX, removeStoredImage } from '../middleware/uploadMiddleware.js';

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  expiry_asc: { expiryDate: 1, _id: 1 },
  expiry_desc: { expiryDate: -1, _id: -1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Finds a product ONLY if it belongs to the logged-in business.
// Someone else's product looks exactly like a missing one (404), so ids can't be probed.
const findOwnedProduct = async (req) => {
  const product = await Product.findOne({ _id: req.params.id, owner: req.user._id });
  if (!product) throw new AppError(404, 'Product not found');
  return product;
};

/**
 * @route   POST /api/products
 */
export const createProduct = asyncHandler(async (req, res) => {
  const data = buildProductData(req.body);

  const product = await Product.create({
    ...data,
    owner: req.user._id, // from the verified JWT, never from the request body
    image: req.file ? `${PRODUCT_IMAGE_URL_PREFIX}/${req.file.filename}` : '',
    collectedQuantity: 0,
    status: 'available',
  });

  await logActivity({
    business: req.user._id,
    type: 'product_listed',
    message: `You listed ${product.name}`,
    product: product._id,
  });

  res.status(201).json({
    success: true,
    message: 'Your surplus product has been published.',
    product: serializeProduct(product.toObject()),
  });
});

/**
 * @route   GET /api/products/my-products?search=&category=&status=&sort=&page=&limit=
 */
export const getMyProducts = asyncHandler(async (req, res) => {
  await expireDueProducts({ owner: req.user._id }); // so the status filter is always accurate

  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 9, maxLimit: 50 });
  const { search, category, status, sort } = req.query;

  const filter = { owner: req.user._id };
  if (search) {
    const pattern = new RegExp(escapeRegex(String(search).trim()), 'i');
    filter.$or = [{ name: pattern }, { description: pattern }];
  }
  if (category) filter.category = category;
  if (status) filter.status = status;

  const now = new Date();
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[sort] || SORTS.newest)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    products: products.map((product) => serializeProduct(product, now)),
    pagination: buildPagination(total, page, limit),
  });
});

/**
 * @route   GET /api/products/:id
 */
export const getProduct = asyncHandler(async (req, res) => {
  await expireDueProducts({ owner: req.user._id });
  const product = await findOwnedProduct(req);

  res.status(200).json({ success: true, product: serializeProduct(product.toObject()) });
});

/**
 * @route   PUT /api/products/:id
 * Replaces the editable fields. Stock counters can only be changed by the reservation service.
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const existing = await findOwnedProduct(req);

  if (existing.status === 'collected') {
    throw new AppError(409, 'Completed listings cannot be edited');
  }

  const unitLocked = Boolean(await DonationRequest.exists({ product: existing._id }));
  const data = buildProductData(req.body, existing, { unitLocked });

  // Image: new upload replaces the old one; "removeImage" deletes it
  let image = existing.image;
  if (req.file) image = `${PRODUCT_IMAGE_URL_PREFIX}/${req.file.filename}`;
  else if (req.body.removeImage === 'true') image = '';

  // Recalculate the status. A manual pause stays unless the product expired.
  let status = computeStatus({ ...data, collectedQuantity: existing.collectedQuantity });
  if (existing.status === 'unavailable' && status !== 'collected' && status !== 'expired') {
    status = 'unavailable';
  }

  // The stock numbers in the filter make this safe: if a reservation happened while the
  // owner was editing, nothing matches and we ask them to reload instead of overwriting it.
  const updated = await Product.findOneAndUpdate(
    {
      _id: existing._id,
      owner: req.user._id,
      totalQuantity: existing.totalQuantity,
      availableQuantity: existing.availableQuantity,
      collectedQuantity: existing.collectedQuantity,
    },
    { $set: { ...data, image, status } },
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new AppError(
      409,
      'This listing just changed (for example a request was accepted). Please reload and try again.'
    );
  }

  if (image !== existing.image) removeStoredImage(existing.image);

  await logActivity({
    business: req.user._id,
    type: 'product_updated',
    message: `You updated ${updated.name}`,
    product: updated._id,
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    product: serializeProduct(updated.toObject()),
  });
});

/**
 * @route   PATCH /api/products/:id/status
 * Body: { "status": "unavailable" } pauses the listing, { "status": "available" } resumes it.
 */
export const updateProductStatus = asyncHandler(async (req, res) => {
  const product = await findOwnedProduct(req);
  const { status } = req.body;
  const now = new Date();

  let updated;

  if (status === 'unavailable') {
    const pausable = ['available', 'partially_reserved', 'fully_reserved'];
    if (!pausable.includes(product.status) || product.expiryDate <= now) {
      throw new AppError(409, 'Only active listings can be marked as unavailable');
    }
    updated = await Product.findOneAndUpdate(
      { _id: product._id, owner: req.user._id, status: product.status },
      { $set: { status: 'unavailable' } },
      { new: true }
    );
  } else {
    if (product.status !== 'unavailable') {
      throw new AppError(409, 'Only unavailable listings can be made available again');
    }
    if (product.expiryDate <= now) {
      throw new AppError(409, 'This listing has expired. Edit its expiry date if the product is still safe to donate.');
    }
    updated = await Product.findOneAndUpdate(
      { _id: product._id, owner: req.user._id, status: 'unavailable' },
      { $set: { status: computeStatus(product, now) } },
      { new: true }
    );
  }

  if (!updated) throw new AppError(409, 'This listing just changed. Please reload and try again.');

  await logActivity({
    business: req.user._id,
    type: 'product_updated',
    message:
      status === 'unavailable'
        ? `You marked ${updated.name} as unavailable`
        : `You made ${updated.name} available again`,
    product: updated._id,
  });

  res.status(200).json({
    success: true,
    message: status === 'unavailable' ? 'Listing marked as unavailable.' : 'Listing is available again.',
    product: serializeProduct(updated.toObject()),
  });
});

/**
 * @route   DELETE /api/products/:id
 * Refuses to delete anything that others depend on.
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await findOwnedProduct(req);

  const acceptedCount = await DonationRequest.countDocuments({ product: product._id, status: 'accepted' });
  if (acceptedCount > 0 || getReservedQuantity(product) > QUANTITY_EPSILON) {
    throw new AppError(
      409,
      'This listing has accepted requests waiting for pickup. Cancel or complete those collections first.'
    );
  }

  const collectedCount = await DonationRequest.countDocuments({ product: product._id, status: 'collected' });
  if (collectedCount > 0 || product.collectedQuantity > QUANTITY_EPSILON) {
    throw new AppError(
      409,
      'Listings with completed donations are kept for your donation history. Mark it as unavailable instead.'
    );
  }

  const pending = await DonationRequest.find({ product: product._id, status: 'pending' })
    .select('requester')
    .lean();

  // Product and its open requests are removed together
  await runInTransaction(async (session) => {
    await DonationRequest.deleteMany(
      { product: product._id, status: { $in: ['pending', 'rejected'] } },
      { session }
    );
    await Product.deleteOne({ _id: product._id, owner: req.user._id }, { session });
  });

  removeStoredImage(product.image);

  // Tell people who were waiting for an answer
  const requesterIds = [...new Set(pending.map((request) => String(request.requester)))];
  await Promise.all(
    requesterIds.map((user) =>
      notifyUser({
        user,
        type: 'request',
        title: 'Listing removed',
        message: `${product.name} is no longer available because the business removed the listing.`,
      })
    )
  );

  res.status(200).json({ success: true, message: 'Product deleted successfully.' });
});