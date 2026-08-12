import { prisma } from '../prisma/prisma.config.js';
import { getDayBounds } from '../utils/date.js';

export const getTodayWaterIntake = async (userId: string, dateParam?: string) => {
    const { startOfDay, tomorrow } = getDayBounds(dateParam);
    const logs = await prisma.waterLog.findMany({
        where: {
            userId,
            date: {
                gte: startOfDay,
                lt: tomorrow
            }
        }
    });

    return logs.reduce((sum, log) => sum + log.amount, 0);
};

export const addWaterLog = async (userId: string, amount: number, dateParam?: string) => {
    if (!amount || amount <= 0) throw new Error('INVALID_AMOUNT');

    const logDate = dateParam ? new Date(dateParam) : new Date();

    if (dateParam) {
        logDate.setUTCHours(12, 0, 0, 0);
    }

    return await prisma.waterLog.create({
        data: { userId, amount: Number(amount), date: logDate }
    });
};

export const removeWaterLog = async (userId: string, amount: number, dateParam?: string) => {
    if (!amount || amount <= 0) throw new Error('INVALID_AMOUNT');

    const currentTotal = await getTodayWaterIntake(userId, dateParam);
    if (currentTotal < amount) throw new Error('NOT_ENOUGH_WATER_TO_REMOVE');

    const logDate = dateParam ? new Date(dateParam) : new Date();

    if (dateParam) {
        logDate.setUTCHours(12, 0, 0, 0);
    }

    return await prisma.waterLog.create({
        data: { userId, amount: -Number(amount), date: logDate }
    });
};