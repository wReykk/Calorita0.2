import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';

const router = Router();

router.use(authenticate);

router.get('/search', productController.searchProducts);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', validate(createProductSchema), productController.createProduct);
router.put('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;