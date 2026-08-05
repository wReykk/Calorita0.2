import { prisma } from '../prisma/prisma.config.js';

interface IngredientInput {
    productId: string;
    amount: number;
}

export class RecipeService {
    public async createRecipe(userId: string, data: { name: string; totalWeight: number; ingredients: IngredientInput[] }) {
        if (!data.ingredients || data.ingredients.length === 0) {
            throw new Error('Recipe must contain at least 1 ingedient.');
        }

        const productIds = data.ingredients.map(i => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        if (products.length !== productIds.length) {
            throw new Error('Some ingredients were not found in data base.');
        }

        let totalCalories = 0;
        let totalProtein = 0;
        let totalFat = 0;
        let totalCarbs = 0;

        for (const item of data.ingredients) {
            const product = products.find(p => p.id === item.productId)!;

            const isPiece = !!product.pieceName;
            const multiplier = isPiece ? item.amount : item.amount / 100;

            totalCalories += (product.calories ?? 0) * multiplier;
            totalProtein += (product.protein ?? 0) * multiplier;
            totalFat += (product.fat ?? 0) * multiplier;
            totalCarbs += (product.carbs ?? 0) * multiplier;
        }
        const recipeMultiplier = 100 / data.totalWeight;

        return await prisma.$transaction(async (tx) => {
            const recipe = await tx.product.create({
                data: {
                    userId,
                    name: data.name,
                    isRecipe: true,
                    calories: Number((totalCalories * recipeMultiplier).toFixed(2)),
                    protein: Number((totalProtein * recipeMultiplier).toFixed(2)),
                    fat: Number((totalFat * recipeMultiplier).toFixed(2)),
                    carbs: Number((totalCarbs * recipeMultiplier).toFixed(2)),
                    isGlobal: false
                }
            });

            const ingredientsData = data.ingredients.map(item => ({
                recipeId: recipe.id,
                ingredientId: item.productId,
                amount: item.amount
            }));

            await tx.recipeIngredient.createMany({
                data: ingredientsData
            });

            return await tx.product.findUnique({
                where: { id: recipe.id },
                include: {
                    recipeIngredients: {
                        include: {
                            ingredient: true
                        }
                    }
                }
            });
        });
    }

    public async getUserRecipes(userId: string) {
        return await prisma.product.findMany({
            where: { userId, isRecipe: true },
            orderBy: { name: 'asc' }
        });
    }

    public async getRecipeById(recipeId: string, userId: string) {
        const recipe = await prisma.product.findFirst({
            where: { id: recipeId, userId, isRecipe: true },
            include: {
                recipeIngredients: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        if (!recipe) throw new Error('Recipe was not found.');
        return recipe;
    }

    // Обновить существующий рецепт
    public async updateRecipe(recipeId: string, userId: string, data: { name: string; totalWeight: number; ingredients: IngredientInput[] }) {
        if (!data.ingredients || data.ingredients.length === 0) {
            throw new Error('Recipe must contain at least 1 ingedient.');
        }

        const existingRecipe = await prisma.product.findFirst({
            where: { id: recipeId, userId, isRecipe: true }
        });

        if (!existingRecipe) throw new Error("Recipe was not found or you don't have permission to edit it.");

        const productIds = data.ingredients.map(i => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;

        for (const item of data.ingredients) {
            const product = products.find(p => p.id === item.productId)!;
            const isPiece = !!product.pieceName;
            const multiplier = isPiece ? item.amount : item.amount / 100;

            totalCalories += (product.calories ?? 0) * multiplier;
            totalProtein += (product.protein ?? 0) * multiplier;
            totalFat += (product.fat ?? 0) * multiplier;
            totalCarbs += (product.carbs ?? 0) * multiplier;
        }

        const recipeMultiplier = 100 / data.totalWeight;

        return await prisma.$transaction(async (tx) => {
            const updatedRecipe = await tx.product.update({
                where: { id: recipeId },
                data: {
                    name: data.name,
                    calories: Number((totalCalories * recipeMultiplier).toFixed(2)),
                    protein: Number((totalProtein * recipeMultiplier).toFixed(2)),
                    fat: Number((totalFat * recipeMultiplier).toFixed(2)),
                    carbs: Number((totalCarbs * recipeMultiplier).toFixed(2)),
                }
            });

            await tx.recipeIngredient.deleteMany({
                where: { recipeId: recipeId }
            });

            const ingredientsData = data.ingredients.map(item => ({
                recipeId: recipeId,
                ingredientId: item.productId,
                amount: item.amount
            }));

            await tx.recipeIngredient.createMany({ data: ingredientsData });

            return updatedRecipe;
        });
    }
}