import { prisma } from '../prisma/prisma.config.js';
import { calculateNutrition } from '../utils/nutritionCalculator.js';

export const addEntry = async (userId: string, data: { productId: string; amount: number; date?: string }) => {
    const product = await prisma.product.findUnique({
        where: { id: data.productId }
    });

    if (!product) {
        throw new Error('Product not found');
    }

    return await prisma.diaryEntry.create({
        data: {
            userId,
            productId: data.productId,
            amount: data.amount,
            ...(data.date && { date: new Date(data.date) }),

            name: product.name,
            calories: product.calories,
            protein: product.protein || 0,
            fat: product.fat || 0,
            carbs: product.carbs || 0,
            pieceName: product.pieceName
        }
    });
};

export const getEntries = async (userId: string) => {
    return await prisma.diaryEntry.findMany({
        where: { userId },
        orderBy: {
            date: 'desc'
        }
    });
};

export const updateEntry = async (id: string, userId: string, data: { weight?: number; amount?: number }) => {
    const weight = typeof data.weight === 'number' ? data.weight : data.amount;

    if (typeof weight !== 'number' || weight <= 0) {
        throw new Error('Weight must be a positive number');
    }

    const existingEntry = await prisma.diaryEntry.findFirst({
        where: { id, userId }
    });

    if (!existingEntry) {
        return null;
    }

    const updatedEntry = await prisma.diaryEntry.update({
        where: { id },
        data: { amount: weight }
    });

    const nutrition = calculateNutrition(
        {
            calories: existingEntry.calories,
            protein: existingEntry.protein,
            fat: existingEntry.fat,
            carbs: existingEntry.carbs,
        },
        weight,
        !!existingEntry.pieceName
    );

    return {
        ...updatedEntry,
        nutrition
    };
};

export const deleteEntry = async (id: string, userId: string) => {
    const { count } = await prisma.diaryEntry.deleteMany({
        where: { id, userId }
    });

    if (count === 0) {
        throw new Error('Entry not found or access denied');
    }
};

export const getDailySummary = async (userId: string, dateString?: string) => {
    const targetDate = dateString ? new Date(dateString) : new Date();

    const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

    const rawEntries = await prisma.diaryEntry.findMany({
        where: {
            userId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            }
        }
    });

    const processedEntries = rawEntries.map(entry => {
        const calculatedNutrition = calculateNutrition(
            {
                calories: entry.calories,
                protein: entry.protein,
                fat: entry.fat,
                carbs: entry.carbs
            },
            entry.amount,
            !!entry.pieceName
        );

        return {
            ...entry,
            calculatedNutrition
        };
    });

    const summary = processedEntries.reduce((acc, entry) => {
        acc.totalCalories += entry.calculatedNutrition.calories;
        acc.totalProtein += entry.calculatedNutrition.protein;
        acc.totalFat += entry.calculatedNutrition.fat;
        acc.totalCarbs += entry.calculatedNutrition.carbs;

        return acc;
    }, { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 });

    const roundedSummary = {
        totalCalories: Number(summary.totalCalories.toFixed(2)),
        totalProtein: Number(summary.totalProtein.toFixed(2)),
        totalFat: Number(summary.totalFat.toFixed(2)),
        totalCarbs: Number(summary.totalCarbs.toFixed(2)),
    };

    return {
        date: startOfDay.toISOString().split('T')[0],
        summary: roundedSummary,
        entries: processedEntries
    };
};