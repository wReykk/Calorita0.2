import { prisma } from '../prisma/prisma.config.js';
import { searchProductsInFatSecret } from './fatsecret.service.js';

export const getAllProducts = async (userId: string) => {
    return await prisma.product.findMany({
        where: { creatorId: userId, isRecipe: false }
    });
};

export const getProductById = async (id: string, userId: string) => {
    return await prisma.product.findFirst({
        where: { id, creatorId: userId }
    });
};

export const createProduct = async (
    userId: string,
    data: { name: string; calories: number; protein?: number; fat?: number; carbs?: number; description?: string; pieceName?: string }
) => {
    return await prisma.product.create({
        data: {
            ...data,
            creatorId: userId
        }
    });
};

export const updateProduct = async (
    id: string,
    userId: string,
    data: { name?: string; calories?: number; protein?: number; fat?: number; carbs?: number; description?: string; pieceName?: string }
) => {
    const existingProduct = await prisma.product.findFirst({
        where: { id, creatorId: userId }
    });

    if (!existingProduct) {
        throw new Error('Product not found or access denied');
    }

    return await prisma.product.update({
        where: { id },
        data: data
    });
};

export const deleteProduct = async (id: string, userId: string) => {
    const { count } = await prisma.product.deleteMany({
        where: { id, creatorId: userId }
    });

    if (count === 0) {
        throw new Error('Product not found or access denied');
    }
};

export const searchLocalProducts = async (userId: string, query: string) => {
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
};

export const searchExternalProducts = async (query: string, lang: string = 'uk') => {
    try {
        return await searchProductsInFatSecret(query, lang);
    } catch (error) {
        console.error('FatSecret error:', error);
        return [];
    }
};