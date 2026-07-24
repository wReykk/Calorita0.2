import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';

const router = Router();
const controller = new ProductController();

router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);

router.post('/', validate(createProductSchema), controller.createProduct);
router.put('/:id', validate(updateProductSchema), controller.updateProduct);

router.delete('/:id', controller.deleteProduct);

export default router;