import crypto from 'crypto';
import bcrypt from 'bcrypt';

import User, { PASSWORD_RESET_MINUTES } from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/token.js';
import { sendEmail } from '../utils/sendEmail.js';
import { passwordResetEmail } from '../utils/emailTemplates.js';
import {
  PROFILE_IMAGE_URL_PREFIX,
  removeStoredImage,
} from '../middleware/uploadMiddleware.js';

// Used so a login for a non-existent email takes as long as a real one
// (stops attackers from discovering which emails are registered by timing).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const FORGOT_PASSWORD_MESSAGE =
  'If an account with that email exists, a password reset link has been sent.';

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    address,
    city,
    state,
    organizationName,
    businessType,
    ngoRegistrationNumber,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, 'An account with this email already exists', {
      email: 'An account with this email already exists',
    });
  }

  // Build the user from an explicit list of fields. Nothing else from req.body is
  // trusted, so a client cannot set isActive, createdAt, etc. `role` was already
  // restricted to business / ngo / individual by the validator.
  const userData = { name, email, password, phone, role, address, city, state };

  if (role === 'business') {
    userData.organizationName = organizationName;
    userData.businessType = businessType;
  }
  if (role === 'ngo') {
    userData.organizationName = organizationName;
    if (ngoRegistrationNumber) userData.ngoRegistrationNumber = ngoRegistrationNumber;
  }
  if (req.file) {
    userData.profileImage = `${PROFILE_IMAGE_URL_PREFIX}/${req.file.filename}`;
  }

  const user = await User.create(userData); // password is hashed in the model

  res.status(201).json({
    success: true,
    message: 'Account created successfully. Please log in.',
    user,
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const remember = rememberMe === true;

  const user = await User.findOne({ email }).select('+password');

  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  // Same message for "no such email" and "wrong password" on purpose
  if (!user || !passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new AppError(403, 'This account has been deactivated. Please contact support.');
  }

  const token = signToken(user._id, remember);
  setAuthCookie(res, token, remember);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    user, // toJSON removes the password hash
  });
});

/**
 * @route   POST /api/auth/logout
 * @access  Public (clearing a cookie is harmless)
 */
export const logout = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

/**
 * @route   PUT /api/auth/profile
 * @access  Private
 * Always updates the logged-in user (req.user). No user id is read from the request.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, phone, address, city, state, organizationName, businessType, ngoRegistrationNumber } =
    req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (city !== undefined) user.city = city;
  if (state !== undefined) user.state = state;

  // Role-specific fields can only be changed by the roles they belong to
  if ((user.role === 'business' || user.role === 'ngo') && organizationName !== undefined) {
    user.organizationName = organizationName;
  }
  if (user.role === 'business' && businessType !== undefined) {
    user.businessType = businessType;
  }
  if (user.role === 'ngo' && ngoRegistrationNumber !== undefined) {
    user.ngoRegistrationNumber = ngoRegistrationNumber;
  }

  const previousImage = user.profileImage;
  if (req.file) {
    user.profileImage = `${PROFILE_IMAGE_URL_PREFIX}/${req.file.filename}`;
  }

  await user.save();

  if (req.file) removeStoredImage(previousImage); // delete the replaced photo

  res.status(200).json({ success: true, message: 'Profile updated successfully', user });
});

/**
 * @route   POST /api/auth/forgot-password
 * @access  Public
 * Always answers the same way, so nobody can learn which emails are registered.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email, isActive: true });

  if (user) {
    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL.replace(/\/$/, '')}/reset-password/${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        ...passwordResetEmail({
          name: user.name,
          resetUrl,
          expiresInMinutes: PASSWORD_RESET_MINUTES,
        }),
      });
    } catch (error) {
      console.error(`❌ Failed to send reset email: ${error.message}`);
      // Remove the unusable token. The user still gets the same generic reply.
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({ success: true, message: FORGOT_PASSWORD_MESSAGE });
});

/**
 * @route   POST /api/auth/reset-password
 * @access  Public (protected by the secret token)
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // We store only the hash of the token, so hash the incoming one to compare.
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }, // not expired
    isActive: true,
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError(400, 'This reset link is invalid or has expired. Please request a new one.');
  }

  user.password = password; // hashed by the model before saving
  user.passwordResetToken = undefined; // single use: the token can never work again
  user.passwordResetExpires = undefined;
  await user.save();

  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: 'Password updated successfully. You can now log in.',
  });
});