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
            const { name, calories, protein, fat, carbs, description, pieceName } = req.body;

            const newProduct = await productService.createProduct(userId, {
                name,
                calories,
                protein,
                fat,
                carbs,
                description,
                pieceName
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

    public searchProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId as string;
            const query = req.query.q as string;

            // Визначаємо мову користувача: спочатку з параметрів url (?lang=uk), потім із заголовків браузера
            const lang = (req.query.lang as string) ||
                (req.headers['accept-language']?.includes('uk') ? 'uk' : 'en');

            if (!query) {
                res.status(400).json({ message: 'Search query is required' });
                return;
            }

            const localProducts = await productService.searchLocalProducts(userId, query);

            // Передаємо визначену мову як другий аргумент
            const externalProducts = await productService.searchExternalProducts(query, lang);

            const combinedProducts = [...localProducts, ...externalProducts];

            res.status(200).json(combinedProducts);
        } catch (error) {
            next(error);
        }
    };
}