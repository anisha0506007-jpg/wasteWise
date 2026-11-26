import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import AppError from '../utils/AppError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');

export const PROFILE_IMAGE_DIR = path.join(UPLOADS_ROOT, 'profile-images');
export const PROFILE_IMAGE_URL_PREFIX = '/uploads/profile-images';
export const PRODUCT_IMAGE_DIR = path.join(UPLOADS_ROOT, 'product-images');
export const PRODUCT_IMAGE_URL_PREFIX = '/uploads/product-images';

fs.mkdirSync(PROFILE_IMAGE_DIR, { recursive: true });
fs.mkdirSync(PRODUCT_IMAGE_DIR, { recursive: true });

// The file extension comes from the allowed type, never from the user's file name.
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg', // covers .jpg and .jpeg files
  'image/png': '.png',
  'image/webp': '.webp',
};

const createImageUploader = ({ dir, field, label, maxBytes }) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, dir),
      filename: (req, file, cb) =>
        cb(null, `${crypto.randomUUID()}${ALLOWED_TYPES[file.mimetype]}`),
    }),
    limits: { fileSize: maxBytes, files: 1, fields: 40, fieldSize: 20 * 1024 },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
      const message = `${label} must be a JPG, PNG, or WebP file`;
      return cb(new AppError(400, message, { [field]: message }));
    },
  }).single(field);

// Reads the optional "profileImage" field from multipart/form-data requests.
export const uploadProfileImage = createImageUploader({
  dir: PROFILE_IMAGE_DIR,
  field: 'profileImage',
  label: 'Profile image',
  maxBytes: 2 * 1024 * 1024,
});

// Reads the optional "productImage" field (max 5 MB).
export const uploadProductImage = createImageUploader({
  dir: PRODUCT_IMAGE_DIR,
  field: 'productImage',
  label: 'Product image',
  maxBytes: 5 * 1024 * 1024,
});

// The browser's declared type can be faked, so also check the file's first bytes.
const looksLikeImage = (head, mimetype) => {
  if (mimetype === 'image/jpeg') return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  if (mimetype === 'image/png') {
    return head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimetype === 'image/webp') {
    return head.subarray(0, 4).toString('ascii') === 'RIFF' && head.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
};

// Put this right AFTER the upload middleware
export const verifyImageSignature = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const handle = await fs.promises.open(req.file.path, 'r');
    const head = Buffer.alloc(12);
    await handle.read(head, 0, 12, 0);
    await handle.close();

    if (looksLikeImage(head, req.file.mimetype)) return next();

    removeUploadedFile(req.file);
    const message = 'The file content is not a valid JPG, PNG, or WebP image';
    return next(new AppError(400, message, { [req.file.fieldname]: message }));
  } catch (error) {
    return next(error);
  }
};

// Deletes a file that multer just saved (used when the request fails).
export const removeUploadedFile = (file) => {
  if (file?.path) fs.unlink(file.path, () => {});
};

const STORED_DIRS = {
  [PROFILE_IMAGE_URL_PREFIX]: PROFILE_IMAGE_DIR,
  [PRODUCT_IMAGE_URL_PREFIX]: PRODUCT_IMAGE_DIR,
};

// Deletes an older stored image using its public path, e.g. "/uploads/product-images/abc.jpg".
export const removeStoredImage = (publicPath) => {
  if (!publicPath) return;
  const prefix = Object.keys(STORED_DIRS).find((item) => publicPath.startsWith(`${item}/`));
  if (!prefix) return;
  const fileName = path.basename(publicPath); // basename blocks "../" tricks
  fs.unlink(path.join(STORED_DIRS[prefix], fileName), () => {});
};