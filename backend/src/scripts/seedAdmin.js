import 'dotenv/config';
import mongoose from 'mongoose';

import User from '../models/User.js';

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

const seedAdmin = async () => {
  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ Set MONGO_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.');
    process.exit(1);
  }

  if (!STRONG_PASSWORD.test(ADMIN_PASSWORD)) {
    console.error(
      '❌ ADMIN_PASSWORD must be 8-64 characters with uppercase, lowercase, number and special character.'
    );
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  try {
    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`ℹ️  An admin already exists (${existingAdmin.email}). Nothing was changed.`);
      return;
    }

    if (await User.findOne({ email })) {
      console.error('❌ A non-admin account already uses that email. Choose a different ADMIN_EMAIL.');
      process.exitCode = 1;
      return;
    }

    // The role is set here, on the server, and never through the public API.
    await User.create({
      name: ADMIN_NAME.trim(),
      email,
      password: ADMIN_PASSWORD, // hashed by the model
      role: 'admin',
    });

    console.log(`✅ Admin account created for ${email}`);
    console.log('👉 Now delete ADMIN_PASSWORD from backend/.env.');
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin().catch((error) => {
  console.error(`❌ Seeding failed: ${error.message}`);
  process.exit(1);
});