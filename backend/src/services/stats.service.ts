import { prisma } from '../prisma/prisma.config.js';
import { calculateNutrition } from '../utils/nutritionCalculator.js';

export const getNutritionalStats = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true }
    });

    if (!user) throw new Error('User not found');

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const thirtyDaysAgo = new Date(today.getTime());
    thirtyDaysAgo.setUTCDate(today.getUTCDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today.getTime());
    sevenDaysAgo.setUTCDate(today.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const daysSinceReg = Math.max(1, Math.ceil((today.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)));

    const weeklyDivisor = Math.min(7, daysSinceReg);
    const monthlyDivisor = Math.min(30, daysSinceReg);

    const entries = await prisma.diaryEntry.findMany({
        where: {
            userId,
            date: {
                gte: thirtyDaysAgo,
            }
        },
        select: {
            date: true,
            calories: true,
            protein: true,
            fat: true,
            carbs: true,
            amount: true,
            pieceName: true
        }
    });

    const waterLogs = await prisma.waterLog.findMany({
        where: {
            userId,
            date: { gte: thirtyDaysAgo }
        },
        select: { date: true, amount: true }
    });

    const weeklySum = { calories: 0, protein: 0, fat: 0, carbs: 0, water: 0 };
    const monthlySum = { calories: 0, protein: 0, fat: 0, carbs: 0, water: 0 };

    waterLogs.forEach(log => {
        const logDate = new Date(log.date);
        monthlySum.water += log.amount;

        if (logDate >= sevenDaysAgo) {
            weeklySum.water += log.amount;
        }
    });

    entries.forEach(entry => {
        const logDate = new Date(entry.date);

        const nutrition = calculateNutrition(
            {
                calories: entry.calories,
                protein: entry.protein,
                fat: entry.fat,
                carbs: entry.carbs
            },
            entry.amount,
            !!entry.pieceName
        );

        monthlySum.calories += nutrition.calories;
        monthlySum.protein += nutrition.protein;
        monthlySum.fat += nutrition.fat;
        monthlySum.carbs += nutrition.carbs;

        if (logDate >= sevenDaysAgo) {
            weeklySum.calories += nutrition.calories;
            weeklySum.protein += nutrition.protein;
            weeklySum.fat += nutrition.fat;
            weeklySum.carbs += nutrition.carbs;
        }
    });

    return {
        weekly: {
            calories: Math.round(weeklySum.calories / weeklyDivisor),
            protein: Math.round(weeklySum.protein / weeklyDivisor),
            fat: Math.round(weeklySum.fat / weeklyDivisor),
            carbs: Math.round(weeklySum.carbs / weeklyDivisor),
            water: Math.round(weeklySum.water / weeklyDivisor),
        },
        monthly: {
            calories: Math.round(monthlySum.calories / monthlyDivisor),
            protein: Math.round(monthlySum.protein / monthlyDivisor),
            fat: Math.round(monthlySum.fat / monthlyDivisor),
            carbs: Math.round(monthlySum.carbs / monthlyDivisor),
            water: Math.round(monthlySum.water / monthlyDivisor),
        }
    };
};