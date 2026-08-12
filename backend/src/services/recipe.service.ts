import { prisma } from '../prisma/prisma.config.js';

export interface IngredientInput {
    productId: string;
    amount: number;
    name?: string;
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    pieceName?: string;
}

export interface Recipe {
    id: number;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}

const processIngredients = async (ingredients: IngredientInput[], userId: string) => {
    let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
    const resolvedIngredients: { localProductId: string; amount: number }[] = [];

    for (const item of ingredients) {
        let product = await prisma.product.findFirst({
            where: { id: item.productId }
        });

        if (!product) {
            if (!item.name || item.calories === undefined) {
                throw new Error(`Ingredient data is missing for external product ${item.productId}`);
            }
            product = await prisma.product.create({
                data: {
                    creatorId: userId,
                    name: item.name,
                    calories: item.calories,
                    protein: item.protein ?? 0,
                    fat: item.fat ?? 0,
                    carbs: item.carbs ?? 0,
                    pieceName: item.pieceName ?? null,
                    isGlobal: true,
                    isRecipe: false
                }
            });
        }

        resolvedIngredients.push({
            localProductId: product.id,
            amount: item.amount
        });

        const isPiece = !!product.pieceName;
        const multiplier = isPiece ? item.amount : item.amount / 100;

        totalCalories += (product.calories ?? 0) * multiplier;
        totalProtein += (product.protein ?? 0) * multiplier;
        totalFat += (product.fat ?? 0) * multiplier;
        totalCarbs += (product.carbs ?? 0) * multiplier;
    }

    return { totalCalories, totalProtein, totalFat, totalCarbs, resolvedIngredients };
};

export const createRecipe = async (userId: string, data: { name: string; totalWeight: number; ingredients: IngredientInput[] }) => {
    if (!data.ingredients || data.ingredients.length === 0) {
        throw new Error('Recipe must contain at least 1 ingredient.');
    }

    const { totalCalories, totalProtein, totalFat, totalCarbs, resolvedIngredients } = await processIngredients(data.ingredients, userId);
    const recipeMultiplier = 100 / data.totalWeight;

    return await prisma.$transaction(async (tx) => {
        const recipe = await tx.product.create({
            data: {
                creatorId: userId,
                name: data.name,
                isRecipe: true,
                totalWeight: data.totalWeight,
                calories: Number((totalCalories * recipeMultiplier).toFixed(2)),
                protein: Number((totalProtein * recipeMultiplier).toFixed(2)),
                fat: Number((totalFat * recipeMultiplier).toFixed(2)),
                carbs: Number((totalCarbs * recipeMultiplier).toFixed(2)),
                isGlobal: false
            }
        });

        const ingredientsData = resolvedIngredients.map(item => ({
            recipeId: recipe.id,
            ingredientId: item.localProductId,
            amount: item.amount
        }));

        await tx.recipeIngredient.createMany({
            data: ingredientsData
        });

        return await tx.product.findUnique({
            where: { id: recipe.id },
            include: { recipeIngredients: { include: { ingredient: true } } }
        });
    });
};

export const getUserRecipes = async (userId: string) => {
    return await prisma.product.findMany({
        where: { creatorId: userId, isRecipe: true },
        orderBy: { name: 'asc' }
    });
};

export const getRecipeById = async (recipeId: string, userId: string) => {
    const recipe = await prisma.product.findFirst({
        where: { id: recipeId, creatorId: userId, isRecipe: true },
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
};

export const updateRecipe = async (recipeId: string, userId: string, data: { name: string; totalWeight: number; ingredients: IngredientInput[] }) => {
    if (!data.ingredients || data.ingredients.length === 0) {
        throw new Error('Recipe must contain at least 1 ingredient.');
    }

    const existingRecipe = await prisma.product.findFirst({
        where: { id: recipeId, creatorId: userId, isRecipe: true }
    });

    if (!existingRecipe) throw new Error("Recipe was not found or you don't have permission to edit it.");

    const { totalCalories, totalProtein, totalFat, totalCarbs, resolvedIngredients } = await processIngredients(data.ingredients, userId);
    const recipeMultiplier = 100 / data.totalWeight;

    return await prisma.$transaction(async (tx) => {
        const updatedRecipe = await tx.product.update({
            where: { id: recipeId },
            data: {
                name: data.name,
                totalWeight: data.totalWeight,
                calories: Number((totalCalories * recipeMultiplier).toFixed(2)),
                protein: Number((totalProtein * recipeMultiplier).toFixed(2)),
                fat: Number((totalFat * recipeMultiplier).toFixed(2)),
                carbs: Number((totalCarbs * recipeMultiplier).toFixed(2)),
            }
        });

        await tx.recipeIngredient.deleteMany({
            where: { recipeId: recipeId }
        });

        const ingredientsData = resolvedIngredients.map(item => ({
            recipeId: recipeId,
            ingredientId: item.localProductId,
            amount: item.amount
        }));

        await tx.recipeIngredient.createMany({ data: ingredientsData });

        return updatedRecipe;
    });
};

export const deleteRecipe = async (recipeId: string, userId: string) => {
    const existingRecipe = await prisma.product.findFirst({
        where: { id: recipeId, creatorId: userId, isRecipe: true }
    });

    if (!existingRecipe) {
        throw new Error("Recipe was not found or you don't have permission to delete it.");
    }

    return await prisma.$transaction(async (tx) => {
        await tx.recipeIngredient.deleteMany({
            where: { recipeId: recipeId }
        });

        return await tx.product.delete({
            where: { id: recipeId }
        });
    });
};