import type { NextFunction, Response } from 'express';
import * as productService from '../services/product.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const products = await productService.getAllProducts(userId);
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.userId

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

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
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

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.userId

        const updatedProduct = await productService.updateProduct(id, userId, req.body);

        res.status(200).json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.userId

        await productService.deleteProduct(id, userId);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const searchProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const query = req.query.q as string;

        const lang = (req.query.lang as string) ||
            (req.headers['accept-language']?.includes('uk') ? 'uk' : 'en');

        if (!query) {
            res.status(400).json({ message: 'Search query is required' });
            return;
        }

        const localProducts = await productService.searchLocalProducts(userId, query);
        const externalProducts = await productService.searchExternalProducts(query, lang);

        const combinedProducts = [...localProducts, ...externalProducts];

        res.status(200).json(combinedProducts);
    } catch (error) {
        next(error);
    }
};