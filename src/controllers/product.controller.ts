import { type Request, type Response } from 'express';
import { ProductService } from '../services/product.service.js';

const productService = new ProductService();

export class ProductController {
    public getProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await productService.getAllProducts();
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch products' });
        }
    };

    public getProductById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(id);

            if (!product) {
                res.status(404).json({ message: 'No product found' });
                return;
            }

            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch product' });
        }
    };

    public createProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, price, description } = req.body;

            if (!name || price === undefined) {
                res.status(400).json({ message: 'Name and price are required.' });
                return;
            }

            const newProduct = await productService.createProduct({ name, price, description });
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ message: 'Something happened while creating new product' });
        }
    };

    public updateProduct = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updatedProduct = await productService.updateProduct(id, req.body);

            if (!updatedProduct) {
                res.status(404).json({ message: 'No product to update found' });
                return;
            }

            res.status(200).json(updatedProduct);
        } catch (error) {
            res.status(404).json({ message: 'No product to update found or update failed' });
        }
    };

    public deleteProduct = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await productService.deleteProduct(id);
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(404).json({ message: 'No product to delete found' });
        }
    };
}
