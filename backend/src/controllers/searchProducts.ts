import { searchProductsInFatSecret } from "../services/fatsecret.service.js";
import { ProductService } from "../services/product.service.js";
import type { Response } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js"; // Убедись, что путь к AuthRequest правильный

const productService = new ProductService();

export const searchProducts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const query = req.query.q as string;
        const userId = req.userId as string;

        if (!query || query.length < 2) {
            res.json([]);
            return;
        }

        // Ищем одновременно в личной базе и в FatSecret
        const [localProducts, globalProducts] = await Promise.all([
            productService.searchLocalProducts(userId, query),
            searchProductsInFatSecret(query)
        ]);

        // Склеиваем: сначала твои личные продукты, потом глобальные
        res.json([...localProducts, ...globalProducts]);

    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
}