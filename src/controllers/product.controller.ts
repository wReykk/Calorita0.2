import { type NextFunction, type Response } from 'express';
import { ProductService } from '../services/product.service.js';
import { type AuthRequest } from '../middlewares/auth.middleware.js';

const productService = new ProductService();

export class ProductController {
    public getProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId as string;
            const products = await productService.getAllProducts(userId);
            res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    };

    public getProductById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const userId = req.userId as string;

            const product = await productService.getProductById(id, userId);

            if (!product) {
                res.status(404).json({ message: 'No product found' });
                return;
            }

            res.status(200).json(product);
        } catch (error) {
            next(error);
        }
    };

    public createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId as string;
            const { name, calories, protein, fat, carbs, description } = req.body;

            const newProduct = await productService.createProduct(userId, {
                name,
                calories,
                protein,
                fat,
                carbs,
                description
            });

            res.status(201).json(newProduct);
        } catch (error) {
            next(error);
        }
    };

    public updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const userId = req.userId as string;

            const updatedProduct = await productService.updateProduct(id, userId, req.body);

            if (!updatedProduct) {
                res.status(404).json({ message: 'No product to update found' });
                return;
            }

            res.status(200).json(updatedProduct);
        } catch (error) {
            next(error);
        }
    };

    public deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const userId = req.userId as string;

            await productService.deleteProduct(id, userId);

            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            next(error);
        }
    };
}