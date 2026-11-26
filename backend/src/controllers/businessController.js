import mongoose from 'mongoose';

import Activity from '../models/Activity.js';
import DonationRequest, { REQUEST_STATUSES } from '../models/DonationRequest.js';
import Notification from '../models/Notification.js';
import Product, { RESERVABLE_STATUSES } from '../models/Product.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  SERVER_TIMEZONE,
  endOfDay,
  getMonthKey,
  getMonthStart,
  getSoonThreshold,
  round2,
} from '../utils/dateHelpers.js';
import { buildPagination, parsePagination } from '../utils/pagination.js';
import { serializeProduct } from '../utils/productHelpers.js';

const PRODUCTS_COLLECTION = Product.collection.name;
const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRED_ALERT_DAYS = 7; // expired stock stays in the alerts for a week

// Percent change vs the previous period. null when there is nothing to compare with.
const buildTrend = (current, previous) => ({
  current: round2(current),
  previous: round2(previous),
  percentChange: previous > 0 ? Math.round(((current - previous) / previous) * 100) : null,
});

/**
 * @route   GET /api/business/dashboard
 * Statistic cards. EVERY query is filtered by the logged-in business (req.user._id).
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const business = req.user._id;
  const now = new Date();
  const soon = getSoonThreshold(now);
  const thisMonth = getMonthStart(0, now);
  const lastMonth = getMonthStart(-1, now);
  const inLastMonth = { $gte: lastMonth, $lt: thisMonth };
  const expiredSince = new Date(now.getTime() - EXPIRED_ALERT_DAYS * DAY_MS);

  const listed = { owner: business };
  const inStock = {
    owner: business,
    status: { $in: RESERVABLE_STATUSES },
    availableQuantity: { $gt: 0 },
  };
  // Expired products that still had stock left (works even if the expiry job has not run yet)
  const expiredStock = {
    owner: business,
    status: { $in: [...RESERVABLE_STATUSES, 'expired'] },
    availableQuantity: { $gt: 0 },
    expiryDate: { $lt: now, $gte: expiredSince },
  };

  const [
    totalProducts,
    productsThisMonth,
    productsLastMonth,
    availableProducts,
    nearExpiry,
    expiredCount,
    successfulDonations,
    collectedThisMonth,
    collectedLastMonth,
    pendingRequests,
    receivedThisMonth,
    receivedLastMonth,
    rescuedByUnit,
  ] = await Promise.all([
    Product.countDocuments(listed),
    Product.countDocuments({ ...listed, createdAt: { $gte: thisMonth } }),
    Product.countDocuments({ ...listed, createdAt: inLastMonth }),
    Product.countDocuments({ ...inStock, expiryDate: { $gt: now } }),
    Product.countDocuments({ ...inStock, expiryDate: { $gte: now, $lte: soon } }),
    Product.countDocuments(expiredStock),
    DonationRequest.countDocuments({ business, status: 'collected' }),
    DonationRequest.countDocuments({ business, status: 'collected', collectedAt: { $gte: thisMonth } }),
    DonationRequest.countDocuments({ business, status: 'collected', collectedAt: inLastMonth }),
    DonationRequest.countDocuments({ business, status: 'pending' }),
    DonationRequest.countDocuments({ business, createdAt: { $gte: thisMonth } }),
    DonationRequest.countDocuments({ business, createdAt: inLastMonth }),
    // Quantity rescued, grouped by unit (kg, pieces...) so units are never mixed silently
    DonationRequest.aggregate([
      { $match: { business, status: 'collected' } },
      {
        $lookup: {
          from: PRODUCTS_COLLECTION,
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$product.unit', 'units'] },
          quantity: { $sum: '$requestedQuantity' },
          thisMonth: {
            $sum: { $cond: [{ $gte: ['$collectedAt', thisMonth] }, '$requestedQuantity', 0] },
          },
          lastMonth: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$collectedAt', lastMonth] }, { $lt: ['$collectedAt', thisMonth] }] },
                '$requestedQuantity',
                0,
              ],
            },
          },
        },
      },
      { $sort: { quantity: -1 } },
    ]),
  ]);

  const sumField = (field) => rescuedByUnit.reduce((total, item) => total + item[field], 0);

  res.status(200).json({
    success: true,
    stats: {
      totalProducts: {
        value: totalProducts,
        trend: buildTrend(productsThisMonth, productsLastMonth),
      },
      availableProducts: { value: availableProducts },
      successfulDonations: {
        value: successfulDonations,
        trend: buildTrend(collectedThisMonth, collectedLastMonth),
      },
      pendingRequests: {
        value: pendingRequests,
        trend: buildTrend(receivedThisMonth, receivedLastMonth), // requests received per month
      },
      nearExpiry: { value: nearExpiry, expiredCount },
      quantityRescued: {
        value: round2(sumField('quantity')),
        byUnit: rescuedByUnit.map((item) => ({ unit: item._id, quantity: round2(item.quantity) })),
        trend: buildTrend(sumField('thisMonth'), sumField('lastMonth')),
      },
    },
    generatedAt: now,
  });
});

/**
 * @route   GET /api/business/analytics?months=6
 * Chart data: monthly donations, donations by category, requests by status.
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const business = req.user._id;
  const now = new Date();
  const months = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 1), 12);
  const rangeStart = getMonthStart(-(months - 1), now);

  const [monthlyRaw, categoryRaw, statusRaw] = await Promise.all([
    DonationRequest.aggregate([
      { $match: { business, status: 'collected', collectedAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$collectedAt', timezone: SERVER_TIMEZONE },
          },
          donations: { $sum: 1 },
          quantity: { $sum: '$requestedQuantity' },
        },
      },
    ]),
    DonationRequest.aggregate([
      { $match: { business, status: 'collected' } },
      {
        $lookup: {
          from: PRODUCTS_COLLECTION,
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$product.category', 'Other'] },
          donations: { $sum: 1 },
          quantity: { $sum: '$requestedQuantity' },
        },
      },
      { $sort: { donations: -1, _id: 1 } },
    ]),
    DonationRequest.aggregate([
      { $match: { business } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // Fill months that have no donations with zeros so the chart has no gaps
  const monthlyMap = new Map(monthlyRaw.map((item) => [item._id, item]));
  const monthly = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const monthDate = getMonthStart(-i, now);
    const found = monthlyMap.get(getMonthKey(monthDate));
    monthly.push({
      key: getMonthKey(monthDate),
      label: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      donations: found ? found.donations : 0,
      quantity: found ? round2(found.quantity) : 0,
    });
  }

  const statusMap = new Map(statusRaw.map((item) => [item._id, item.count]));

  res.status(200).json({
    success: true,
    monthly,
    categories: categoryRaw.map((item) => ({
      category: item._id,
      donations: item.donations,
      quantity: round2(item.quantity),
    })),
    status: REQUEST_STATUSES.map((status) => ({ status, count: statusMap.get(status) || 0 })),
  });
});

/**
 * @route   GET /api/business/recent-products?page=1&limit=5
 */
export const getRecentProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 5, maxLimit: 20 });
  const filter = { owner: req.user._id };
  const now = new Date();

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        'name category totalQuantity availableQuantity collectedQuantity unit expiryDate image status createdAt'
      )
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
 * @route   GET /api/business/recent-requests?page=1&limit=5
 * Only the requester's public name and role are returned (no email or phone).
 */
export const getRecentRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 5, maxLimit: 20 });
  const filter = { business: req.user._id };

  const [requests, total] = await Promise.all([
    DonationRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'product', select: 'name unit category' })
      .populate({ path: 'requester', select: 'name role organizationName' })
      .lean(),
    DonationRequest.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    requests: requests.map((request) => ({
      id: String(request._id),
      requesterName:
        request.requester?.organizationName || request.requester?.name || 'Deleted user',
      requesterRole: request.requester?.role || null,
      productName: request.product?.name || 'Deleted product',
      unit: request.product?.unit || '',
      requestedQuantity: request.requestedQuantity,
      status: request.status,
      createdAt: request.createdAt,
    })),
    pagination: buildPagination(total, page, limit),
  });
});

/**
 * @route   GET /api/business/expiry-alerts?page=1&limit=10
 * Products with stock left that expire within the "soon" window, or expired in the last 7 days.
 * Order: not-yet-expired first (soonest first), then expired (most recent first).
 */
export const getExpiryAlerts = asyncHandler(async (req, res) => {
  const business = req.user._id;
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 50 });
  const now = new Date();
  const todayEnd = endOfDay(now);
  const soon = getSoonThreshold(now);
  const expiredSince = new Date(now.getTime() - EXPIRED_ALERT_DAYS * DAY_MS);

  const stock = {
    owner: business,
    status: { $in: [...RESERVABLE_STATUSES, 'expired'] },
    availableQuantity: { $gt: 0 },
  };

  const [expired, expiresToday, expiringSoon, alerts] = await Promise.all([
    Product.countDocuments({ ...stock, expiryDate: { $gte: expiredSince, $lt: now } }),
    Product.countDocuments({ ...stock, expiryDate: { $gte: now, $lte: todayEnd } }),
    Product.countDocuments({ ...stock, expiryDate: { $gt: todayEnd, $lte: soon } }),
    Product.aggregate([
      { $match: { ...stock, expiryDate: { $gte: expiredSince, $lte: soon } } },
      { $addFields: { isExpired: { $lt: ['$expiryDate', now] } } },
      {
        $addFields: {
          urgency: {
            $cond: [
              '$isExpired',
              { $subtract: [now, '$expiryDate'] },
              { $subtract: ['$expiryDate', now] },
            ],
          },
        },
      },
      { $sort: { isExpired: 1, urgency: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]),
  ]);

  res.status(200).json({
    success: true,
    alerts: alerts.map((product) => serializeProduct(product, now)),
    summary: { expired, expiresToday, expiringSoon },
    pagination: buildPagination(expired + expiresToday + expiringSoon, page, limit),
  });
});

/**
 * @route   GET /api/business/activity?page=1&limit=10
 */
export const getActivity = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 50 });
  const filter = { business: req.user._id };

  const [items, total] = await Promise.all([
    Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Activity.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    activities: items.map((item) => ({
      id: String(item._id),
      type: item.type,
      message: item.message,
      createdAt: item.createdAt,
    })),
    pagination: buildPagination(total, page, limit),
  });
});

/**
 * @route   GET /api/business/profile
 * (Updating uses the same updateProfile controller as /api/auth/profile.)
 */
export const getProfile = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

/**
 * @route   GET /api/business/notifications?page=1&limit=10
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 50 });
  const filter = { user: req.user._id };

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    notifications: items.map((item) => ({
      id: String(item._id),
      type: item.type,
      title: item.title,
      message: item.message,
      link: item.link,
      isRead: item.isRead,
      createdAt: item.createdAt,
    })),
    unreadCount,
    pagination: buildPagination(total, page, limit),
  });
});

/**
 * @route   PUT /api/business/notifications/read-all
 */
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );
  res.status(200).json({ success: true, updated: result.modifiedCount });
});

/**
 * @route   PUT /api/business/notifications/:id/read
 * The filter includes user: req.user._id, so nobody can touch another user's notification.
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid notification id');
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new AppError(404, 'Notification not found');

  res.status(200).json({ success: true });
});