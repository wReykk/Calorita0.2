import { prisma } from '../prisma/prisma.config.js';
import { searchProductsInFatSecret } from './fatsecret.service.js';

export class ProductService {

    public async getAllProducts(userId: string) {
        return await prisma.product.findMany({
            where: { creatorId: userId, isRecipe: false }
        });
    }

    public async getProductById(id: string, userId: string) {
        return await prisma.product.findFirst({
            where: { id, creatorId: userId }
        });
    }

    public async createProduct(userId: string, data: { name: string; calories: number; protein?: number; fat?: number; carbs?: number; description?: string; pieceName?: string }) {
        return await prisma.product.create({
            data: {
                ...data,
                creatorId: userId
            }
        });
    }

    public async updateProduct(id: string, userId: string, data: { name?: string; calories?: number; protein?: number; fat?: number; carbs?: number; description?: string; pieceName?: string }) {
        return await prisma.product.update({
            where: { id, creatorId: userId },
            data: data
        });
    }

    public async deleteProduct(id: string, userId: string) {
        await prisma.product.delete({
            where: { id, creatorId: userId }
        });
    }

    public async searchLocalProducts(userId: string, query: string) {
        const localProducts = await prisma.product.findMany({
            where: {
                creatorId: userId,
                name: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            take: 10
        });

        return localProducts.map(p => ({
            id: p.id,
            name: p.name,
            calories: p.calories,
            protein: p.protein,
            fat: p.fat,
            carbs: p.carbs,
            externalId: p.id,
            description: p.pieceName ? `${p.pieceName} - Calories: ${p.calories}kcal` : `Per 100g - Calories: ${p.calories}kcal`,
            pieceName: p.pieceName,
            isGlobal: false
        }));
    }

    public async searchExternalProducts(query: string, lang: string = 'uk') {
        try {
            return await searchProductsInFatSecret(query, lang);
        } catch (error) {
            console.error('FatSecret error:', error);
            return [];
        }
    }
}