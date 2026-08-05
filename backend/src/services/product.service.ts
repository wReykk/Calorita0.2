import { prisma } from '../prisma/prisma.config.js';
import axios from 'axios';

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

    public async createProduct(userId: string, data: { name: string; calories: number; protein?: number; fat?: number; carbs?: number; description?: string; pieceName?: string }) {
        return await prisma.product.create({
            data: {
                ...data,
                userId
            }
        });
    }

    public async updateProduct(id: string, userId: string, data: { name?: string; calories?: number; protein?: number; fat?: number; carbs?: number; description?: string; pieceName?: string }) {
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
            externalId: p.id,
            description: p.pieceName ? `${p.pieceName} - Calories: ${p.calories}kcal` : `Per 100g - Calories: ${p.calories}kcal`,
            pieceName: p.pieceName,
            isGlobal: false
        }));


    }

    public async searchExternalProducts(query: string) {
        try {
            const response = await axios.get('https://ua.openfoodfacts.org/cgi/search.pl', {
                params: {
                    search_terms: query,
                    search_simple: 1,
                    action: 'process',
                    json: 1,
                    page_size: 15
                }
            });

            const products = response.data.products || [];

            return products
                .map((product: any) => {
                    const nutriments = product.nutriments || {};

                    const calories = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy_100g'] || 0);
                    const protein = Math.round((nutriments['proteins_100g'] || 0) * 10) / 10;
                    const fat = Math.round((nutriments['fat_100g'] || 0) * 10) / 10;
                    const carbs = Math.round((nutriments['carbohydrates_100g'] || 0) * 10) / 10;

                    const name = product.product_name_ru || product.product_name_en || product.product_name || 'Unknown product';

                    const brand = product.brands ? ` (${product.brands.split(',')[0]})` : '';

                    return {
                        id: product._id || product.id,
                        externalId: product._id || product.id,
                        name: `${name}${brand}`,
                        calories: calories,
                        protein: protein,
                        fat: fat,
                        carbs: carbs,
                        description: `100g - Calories: ${calories}Kcal`,
                        pieceName: undefined,
                        isGlobal: true
                    };
                })
                .filter((p: any) => p.calories > 0 && p.name !== 'Unknown product')
                .slice(0, 10);

        } catch (error) {
            console.error('Error while searching Open Food Facts:', error);
            return [];
        }
    }
}