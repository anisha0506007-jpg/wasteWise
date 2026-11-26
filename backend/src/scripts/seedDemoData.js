import 'dotenv/config';
import crypto from 'crypto';
import mongoose from 'mongoose';

import Activity from '../models/Activity.js';
import DonationRequest from '../models/DonationRequest.js';
import Notification from '../models/Notification.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Usage (inside backend/):
//   npm run seed:demo -- biz@test.com            adds demo data
//   npm run seed:demo -- --clear biz@test.com    removes it again

const DEMO_USERS = [
  { key: 'ngo', name: 'Meera Kapoor', email: 'demo.ngo@wastewise.local', role: 'ngo', organizationName: 'Hope Food Foundation' },
  { key: 'person', name: 'Riya Sharma', email: 'demo.person@wastewise.local', role: 'individual' },
];

// Date helpers (negative days = in the past)
const daysFromNow = (days, hour = 18, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
};
const hoursAgo = (hours) => new Date(Date.now() - hours * 3600 * 1000);
const daysAgo = (days) => new Date(Date.now() - days * 24 * 3600 * 1000);

const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');
const email = args.find((arg) => !arg.startsWith('--'))?.trim().toLowerCase();

const clearDemoData = async (business) => {
  await Promise.all([
    Product.deleteMany({ owner: business._id, isDemo: true }),
    DonationRequest.deleteMany({ business: business._id, isDemo: true }),
    Activity.deleteMany({ business: business._id, isDemo: true }),
    Notification.deleteMany({ user: business._id, isDemo: true }),
  ]);
  await User.deleteMany({ email: { $in: DEMO_USERS.map((user) => user.email) } });
  console.log(`🧹 Demo data removed for ${business.email}`);
};

const seedDemoData = async (business) => {
  if (await Product.exists({ owner: business._id, isDemo: true })) {
    console.log('ℹ️  Demo data already exists. Run with --clear first to reset it.');
    return;
  }

  // ----- Demo requesters (they cannot log in: random unknown passwords) -----
  const users = {};
  for (const demo of DEMO_USERS) {
    let user = await User.findOne({ email: demo.email });
    if (!user) {
      user = await User.create({
        name: demo.name,
        email: demo.email,
        password: `${crypto.randomBytes(24).toString('base64')}aA1!`,
        phone: '+91 90000 00000',
        role: demo.role,
        address: '12 Demo Street',
        city: business.city || 'Demo City',
        state: business.state || 'Demo State',
        ...(demo.organizationName && { organizationName: demo.organizationName }),
      });
    }
    users[demo.key] = user;
  }

  // ----- Products -----
  // availableQuantity = total - reserved (accepted) - collected
  const productDefs = [
    { key: 'bread', name: 'Whole Wheat Bread', category: 'Bakery', condition: 'Fresh', totalQuantity: 30, unit: 'pieces', expiryDate: daysFromNow(0, 23, 59), createdAt: hoursAgo(3) },
    { key: 'croissants', name: 'Chocolate Croissants', category: 'Bakery', condition: 'Good', totalQuantity: 24, availableQuantity: 6, collectedQuantity: 12, status: 'partially_reserved', unit: 'pieces', expiryDate: daysFromNow(2, 18), createdAt: daysAgo(6) },
    { key: 'biryani', name: 'Vegetable Biryani', category: 'Cooked Food', condition: 'Fresh', totalQuantity: 15, unit: 'kg', expiryDate: daysFromNow(1, 12), createdAt: hoursAgo(30) },
    { key: 'milk', name: 'Fresh Milk Packets', category: 'Dairy', condition: 'Fresh', totalQuantity: 50, unit: 'packets', expiryDate: daysFromNow(5), createdAt: daysAgo(4) },
    { key: 'fruit', name: 'Seasonal Fruit Box', category: 'Fruits', condition: 'Fresh', totalQuantity: 20, unit: 'kg', expiryDate: daysFromNow(7), createdAt: daysAgo(6) },
    { key: 'noodles', name: 'Instant Noodles', category: 'Packaged Food', condition: 'Good', totalQuantity: 100, availableQuantity: 70, status: 'partially_reserved', unit: 'packets', expiryDate: daysFromNow(60), createdAt: daysAgo(12) },
    { key: 'juice', name: 'Orange Juice Bottles', category: 'Beverages', condition: 'Near Expiry', totalQuantity: 36, unit: 'pieces', status: 'expired', expiryDate: daysFromNow(-2, 12), createdAt: daysAgo(14) },
    { key: 'rice', name: 'Rice Bags', category: 'Grocery', condition: 'Good', totalQuantity: 50, availableQuantity: 0, collectedQuantity: 50, status: 'collected', unit: 'kg', expiryDate: daysFromNow(90), createdAt: daysAgo(60) },
    { key: 'buns', name: 'Cream Buns', category: 'Bakery', condition: 'Fresh', totalQuantity: 40, availableQuantity: 0, collectedQuantity: 40, status: 'collected', unit: 'pieces', expiryDate: daysFromNow(-1, 12), createdAt: daysAgo(45) },
    { key: 'pasta', name: 'Pasta Packs', category: 'Packaged Food', condition: 'Good', totalQuantity: 60, status: 'unavailable', unit: 'packets', expiryDate: daysFromNow(30), createdAt: daysAgo(8) },
    { key: 'rolls', name: 'Whole Grain Rolls', category: 'Bakery', condition: 'Good', totalQuantity: 60, availableQuantity: 0, collectedQuantity: 60, status: 'collected', unit: 'pieces', expiryDate: daysFromNow(-70), createdAt: daysAgo(110) },
    { key: 'curry', name: 'Veg Curry Trays', category: 'Cooked Food', condition: 'Good', totalQuantity: 30, availableQuantity: 0, collectedQuantity: 30, status: 'collected', unit: 'kg', expiryDate: daysFromNow(-130), createdAt: daysAgo(170) },
  ];

  const created = await Product.create(
    productDefs.map(({ key, ...fields }) => ({
      description: 'Demo product created by the seed script.',
      pickupAddress: business.address || '12 Market Road',
      city: business.city || 'Demo City',
      state: business.state || 'Demo State',
      postalCode: '110001',
      pickupStartTime: fields.createdAt,
      pickupEndTime: fields.expiryDate,
      ...fields,
      owner: business._id,
      isDemo: true,
    }))
  );
  const products = {};
  created.forEach((doc, index) => {
    products[productDefs[index].key] = doc;
  });

  // ----- Donation requests -----
  const collected = (product, by, quantity, createdDaysAgo, collectedDaysAgo) => ({
    product, by, quantity, status: 'collected',
    createdAt: daysAgo(createdDaysAgo),
    respondedAt: daysAgo((createdDaysAgo + collectedDaysAgo) / 2),
    collectedAt: daysAgo(collectedDaysAgo),
  });
  const open = (product, by, quantity, status, createdHoursAgo) => ({
    product, by, quantity, status,
    createdAt: hoursAgo(createdHoursAgo),
    ...(status !== 'pending' && { respondedAt: hoursAgo(createdHoursAgo - 6) }),
  });

  const requestDefs = [
    // 10 collected
    collected('rice', 'ngo', 20, 6, 5),
    collected('rice', 'person', 30, 41, 40),
    collected('buns', 'ngo', 25, 19, 18),
    collected('buns', 'person', 15, 26, 25),
    collected('croissants', 'ngo', 12, 4, 3),
    collected('rolls', 'ngo', 20, 63, 62),
    collected('rolls', 'person', 20, 79, 78),
    collected('rolls', 'ngo', 20, 96, 95),
    collected('curry', 'ngo', 15, 121, 120),
    collected('curry', 'person', 15, 151, 150),
    // 4 pending (pending requests do NOT reduce stock)
    open('bread', 'ngo', 10, 'pending', 2),
    open('biryani', 'person', 5, 'pending', 5),
    open('milk', 'ngo', 20, 'pending', 26),
    open('fruit', 'person', 8, 'pending', 50),
    // 2 accepted (these are the reserved quantities: 6 croissants, 30 noodles)
    open('croissants', 'person', 6, 'accepted', 30),
    open('noodles', 'ngo', 30, 'accepted', 60),
    // 2 rejected
    open('juice', 'person', 10, 'rejected', 100),
    open('fruit', 'ngo', 4, 'rejected', 120),
  ];

  for (const def of requestDefs) {
    const request = new DonationRequest({
      product: products[def.product]._id,
      business: business._id,
      requester: users[def.by]._id,
      requestedQuantity: def.quantity,
      status: def.status,
      createdAt: def.createdAt,
      respondedAt: def.respondedAt,
      collectedAt: def.collectedAt,
      isDemo: true,
    });
    request.$locals.skipChecks = true; // history may involve products that have since expired
    await request.save();
  }

  // ----- Activity -----
  const activityDefs = [
    ['request_received', 'Hope Food Foundation requested 10 pieces of Whole Wheat Bread', 'bread', hoursAgo(2)],
    ['product_listed', 'You listed Whole Wheat Bread', 'bread', hoursAgo(3)],
    ['request_received', 'Riya Sharma requested 5 kg of Vegetable Biryani', 'biryani', hoursAgo(5)],
    ['request_accepted', "You accepted Riya Sharma's request for Chocolate Croissants", 'croissants', hoursAgo(24)],
    ['product_listed', 'You listed Vegetable Biryani', 'biryani', hoursAgo(30)],
    ['product_collected', 'Hope Food Foundation collected 12 pieces of Chocolate Croissants', 'croissants', daysAgo(3)],
    ['product_updated', 'You updated the quantity of Fresh Milk Packets', 'milk', daysAgo(2)],
    ['request_rejected', 'You declined a request for Orange Juice Bottles', 'juice', hoursAgo(94)],
    ['product_collected', 'Hope Food Foundation collected 20 kg of Rice Bags', 'rice', daysAgo(5)],
  ];
  await Activity.create(
    activityDefs.map(([type, message, key, createdAt]) => ({
      business: business._id, type, message, product: products[key]._id, createdAt, isDemo: true,
    }))
  );

  // ----- Notifications (3 unread, 2 read) -----
  await Notification.create([
    { user: business._id, type: 'request', title: 'New donation request', message: 'Hope Food Foundation requested 10 pieces of Whole Wheat Bread.', link: '/business/requests', isRead: false, createdAt: hoursAgo(2) },
    { user: business._id, type: 'expiry', title: 'Product expires today', message: 'Whole Wheat Bread expires today. Consider accepting a request soon.', link: `/business/products/${products.bread._id}`, isRead: false, createdAt: hoursAgo(1) },
    { user: business._id, type: 'expiry', title: 'Product expiring soon', message: 'Chocolate Croissants expire in 2 days.', link: `/business/products/${products.croissants._id}`, isRead: false, createdAt: hoursAgo(8) },
    { user: business._id, type: 'donation', title: 'Donation collected', message: 'Rice Bags (20 kg) were collected by Hope Food Foundation.', link: '/business/history', isRead: true, createdAt: daysAgo(5) },
    { user: business._id, type: 'system', title: 'Welcome to WasteWise', message: 'Your business dashboard is ready.', link: '', isRead: true, createdAt: daysAgo(30) },
  ].map((n) => ({ ...n, isDemo: true })));

  console.log(`✅ Demo data added for ${business.email}`);
  console.log('   12 products, 18 requests, 9 activities, 5 notifications.');
  console.log('   Expected dashboard (if you seed before 11:59 PM):');
  console.log('   Total 12 | Available 6 | Successful donations 10 | Pending 4 | Near expiry 3 (1 expired) | Rescued 192 (80 kg + 112 pieces)');
};

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Refusing to run demo seeding when NODE_ENV=production.');
    process.exit(1);
  }
  if (!process.env.MONGO_URI || !email) {
    console.error('Usage: npm run seed:demo -- <business-email>   (add --clear to remove demo data)');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  try {
    const business = await User.findOne({ email, role: 'business' });
    if (!business) {
      console.error(`❌ No BUSINESS account found with the email ${email}. Register one first.`);
      process.exitCode = 1;
      return;
    }
    if (shouldClear) await clearDemoData(business);
    else await seedDemoData(business);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(`❌ Seeding failed: ${error.message}`);
  process.exit(1);
});