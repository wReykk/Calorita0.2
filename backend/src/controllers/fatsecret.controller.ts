import { searchProductsInFatSecret } from "../services/fatsecret.service.js";
import type { Request, Response } from "express";

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = req.query.q as string;

        if (!query || query.length < 2) {
            res.json([]);
            return
        }

        const globalProducts = await searchProductsInFatSecret(query);

        res.json(globalProducts);

    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
}