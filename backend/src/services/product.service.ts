import { prisma } from '../prisma/prisma.config.js';

export class ProductService {

    public async getAllProducts(userId: string) {
        return await prisma.product.findMany({
            where: { userId }
        });
    }

    public async getProductById(id: string, userId: string) {
        return await prisma.product.findFirst({
            where: { id, userId }
        });
    }

    public async createProduct(userId: string, data: { name: string; calories: number; protein?: number; fat?: number; carbs?: number; description?: string }) {
        return await prisma.product.create({
            data: {
                ...data,
                userId
            }
        });
    }

    public async updateProduct(id: string, userId: string, data: { name?: string; calories?: number; protein?: number; fat?: number; carbs?: number; description?: string }) {
        return await prisma.product.update({
            where: { id, userId },
            data: data
        });
    }

    public async deleteProduct(id: string, userId: string) {
        await prisma.product.delete({
            where: { id, userId }
        });
    }

    public async searchLocalProducts(userId: string, query: string) {
        const localProducts = await prisma.product.findMany({
            where: {
                userId: userId,
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
            description: p.pieceName ? `Per ${p.pieceName}` : 'Per 100g',
            isGlobal: false
        }));
    }
}