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
}