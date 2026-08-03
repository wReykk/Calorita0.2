import { prisma } from '../prisma/prisma.config.js';

export class DiaryService {

    public async addEntry(userId: string, data: { productId: string; amount: number; date?: string }) {
        return await prisma.diaryEntry.create({
            data: {
                userId,
                productId: data.productId,
                amount: data.amount,
                ...(data.date && { date: new Date(data.date) })
            },
            include: {
                product: true
            }
        });
    }

    public async getEntries(userId: string) {
        return await prisma.diaryEntry.findMany({
            where: { userId },
            include: {
                product: true
            },
            orderBy: {
                date: 'desc'
            }
        });
    }

    public async updateEntry(id: string, userId: string, data: { weight?: number; amount?: number }) {
        const weight = typeof data.weight === 'number' ? data.weight : data.amount;

        if (typeof weight !== 'number' || weight <= 0) {
            throw new Error('Weight must be a positive number');
        }

        const existingEntry = await prisma.diaryEntry.findFirst({
            where: { id, userId },
            include: { product: true }
        });

        if (!existingEntry) {
            return null;
        }

        const isPiece = !!existingEntry.product.pieceName;
        const multiplier = isPiece ? weight : weight / 100;
        const calories = (existingEntry.product.calories ?? 0) * multiplier;
        const protein = (existingEntry.product.protein ?? 0) * multiplier;
        const fat = (existingEntry.product.fat ?? 0) * multiplier;
        const carbs = (existingEntry.product.carbs ?? 0) * multiplier;

        const updatedEntry = await prisma.diaryEntry.update({
            where: { id, userId },
            data: { amount: weight },
            include: { product: true }
        });

        return {
            ...updatedEntry,
            nutrition: {
                calories: Number(calories.toFixed(2)),
                protein: Number(protein.toFixed(2)),
                fat: Number(fat.toFixed(2)),
                carbs: Number(carbs.toFixed(2)),
            }
        };
    }

    public async deleteEntry(id: string, userId: string) {
        await prisma.diaryEntry.delete({
            where: { id, userId }
        });
    }

    public async getDailySummary(userId: string, dateString?: string) {
        const targetDate = dateString ? new Date(dateString) : new Date();

        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const entries = await prisma.diaryEntry.findMany({
            where: {
                userId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            },
            include: {
                product: true
            }
        });

        const summary = entries.reduce((acc, entry) => {
            const isPiece = !!entry.product.pieceName;
            const multiplier = isPiece ? entry.amount : entry.amount / 100;

            acc.totalCalories += entry.product.calories * multiplier;
            acc.totalProtein += (entry.product.protein || 0) * multiplier;
            acc.totalFat += (entry.product.fat || 0) * multiplier;
            acc.totalCarbs += (entry.product.carbs || 0) * multiplier;

            return acc;
        }, { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 });

        return {
            date: startOfDay.toISOString().split('T')[0],
            summary,
            entries
        };
    }
}