import { Router, type RequestHandler } from 'express';
import * as productController from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';

const router = Router();

router.use(authenticate as RequestHandler);

router.get('/search', productController.searchProducts as RequestHandler);
router.get('/', productController.getProducts as RequestHandler);
router.get('/:id', productController.getProductById as RequestHandler);
router.post('/', validate(createProductSchema), productController.createProduct as RequestHandler);
router.put('/:id', validate(updateProductSchema), productController.updateProduct as RequestHandler);
router.delete('/:id', productController.deleteProduct as RequestHandler);

export default router;