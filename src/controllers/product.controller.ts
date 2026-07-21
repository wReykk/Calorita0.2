import { type Request, type Response } from 'express';
import { ProductService } from '../services/product.service.js';

const productService = new ProductService();

export class ProductController {
    public getProducts(req: Request, res: Response): void {
        try {
            const products = productService.getAllProducts();
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error while getting products' });
        }
    }
}