import crypto from 'crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export const PUBLIC_ROLES = ['business', 'ngo', 'individual'];
export const USER_ROLES = [...PUBLIC_ROLES, 'admin'];
export const BUSINESS_TYPES = [
  'Restaurant',
  'Bakery',
  'Grocery Store',
  'Hotel',
  'Supermarket',
  'Other',
];
export const PASSWORD_RESET_MINUTES = 15;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SALT_ROUNDS = 12;

const isNotAdmin = function () {
  return this.role !== 'admin';
};
const isOrganization = function () {
  return this.role === 'business' || this.role === 'ngo';
};
const isBusiness = function () {
  return this.role === 'business';
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email is too long'],
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, 
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number is too long'],
      required: [isNotAdmin, 'Phone number is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: { values: USER_ROLES, message: 'Invalid role' },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
      required: [isNotAdmin, 'Address is required'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [60, 'City cannot exceed 60 characters'],
      required: [isNotAdmin, 'City is required'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [60, 'State cannot exceed 60 characters'],
      required: [isNotAdmin, 'State is required'],
    },
    organizationName: {
      type: String,
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
      required: [isOrganization, 'Organization name is required'],
    },
    businessType: {
      type: String,
      enum: { values: BUSINESS_TYPES, message: 'Invalid business type' },
      required: [isBusiness, 'Business type is required'],
    },
    ngoRegistrationNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Registration number cannot exceed 50 characters'],
    },
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },

    passwordChangedAt: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.passwordChangedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);

  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_MINUTES * 60 * 1000);
  return rawToken;
};

const User = mongoose.model('User', userSchema);

export default User;