import { type Request, type Response } from 'express';
import { ProductService } from '../services/product.service.js';

const productService = new ProductService();

export class ProductController {
    public getProducts = (req: Request, res: Response): void => {
        const products = productService.getAllProducts();
        res.status(200).json(products);
    };

    public getProductById = (req: Request<{ id: string }>, res: Response): void => {
        const { id } = req.params;
        const product = productService.getProductById(id);

        if (!product) {
            res.status(404).json({ message: 'No product found' });
            return;
        }

        res.status(200).json(product);
    };

    public createProduct = (req: Request, res: Response): void => {
        try {
            const { name, calories, protein, fat, carbs } = req.body;

            if (!name || calories === undefined) {
                res.status(400).json({ message: 'Name and calories are necessary.' });
                return;
            }

            const newProduct = productService.createProduct({ name, calories, protein, fat, carbs });
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ message: 'Something happened while creating new product' });
        }
    };

    public updateProduct = (req: Request<{ id: string }>, res: Response): void => {
        const { id } = req.params;
        const updatedProduct = productService.updateProduct(id, req.body);

        if (!updatedProduct) {
            res.status(404).json({ message: 'No product to update found' });
            return;
        }

        res.status(200).json(updatedProduct);
    };

    public deleteProduct = (req: Request<{ id: string }>, res: Response): void => {
        const { id } = req.params;
        const success = productService.deleteProduct(id);

        if (!success) {
            res.status(404).json({ message: 'No product to delete found' });
            return;
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    };
}