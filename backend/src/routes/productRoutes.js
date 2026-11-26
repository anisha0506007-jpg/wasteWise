import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getMyProducts,
  getProduct,
  updateProduct,
  updateProductStatus,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { uploadProductImage, verifyImageSignature } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  idValidation,
  listProductsValidation,
  productValidation,
  statusValidation,
} from '../validators/productValidators.js';

const router = Router();

// Everything below needs a valid login cookie AND the "business" role
router.use(protect, authorize('business'));

// "/my-products" must come before "/:id", or Express would treat "my-products" as an id
router.get('/my-products', listProductsValidation, validate, getMyProducts);

// Order: upload -> check file bytes -> field validation -> controller
router.post('/', uploadProductImage, verifyImageSignature, productValidation, validate, createProduct);

router.get('/:id', idValidation, validate, getProduct);
router.put(
  '/:id',
  idValidation,
  uploadProductImage,
  verifyImageSignature,
  productValidation,
  validate,
  updateProduct
);
router.patch('/:id/status', idValidation, statusValidation, validate, updateProductStatus);
router.delete('/:id', idValidation, validate, deleteProduct);

export default router;