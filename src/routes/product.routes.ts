import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';

const router = Router();
const productController = new ProductController();

router.get('/', productController.getProducts.bind(productController));

export default router;