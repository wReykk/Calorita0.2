import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Вспомогательная функция для получения начала и конца нужного дня
const getDayBounds = (dateParam?: string) => {
    const date = dateParam ? new Date(dateParam) : new Date();
    date.setHours(0, 0, 0, 0); // Начало дня

    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1); // Начало следующего дня

    return { date, tomorrow };
};

export const getTodayWaterIntake = async (userId: string, dateParam?: string) => {
    const { date, tomorrow } = getDayBounds(dateParam);

    const logs = await prisma.waterLog.findMany({
        where: {
            userId,
            date: {
                gte: date,
                lt: tomorrow
            }
        }
    });

    return logs.reduce((sum, log) => sum + log.amount, 0);
};

export const addWaterLog = async (userId: string, amount: number, dateParam?: string) => {
    if (!amount || amount <= 0) throw new Error('INVALID_AMOUNT');

    // Если добавляем воду в прошлый день, ставим время на 12:00 этого дня
    const logDate = dateParam ? new Date(dateParam) : new Date();
    if (dateParam) logDate.setHours(12, 0, 0, 0);

    return await prisma.waterLog.create({
        data: { userId, amount: Number(amount), date: logDate }
    });
};

export const removeWaterLog = async (userId: string, amount: number, dateParam?: string) => {
    if (!amount || amount <= 0) throw new Error('INVALID_AMOUNT');

    const currentTotal = await getTodayWaterIntake(userId, dateParam);
    if (currentTotal < amount) throw new Error('NOT_ENOUGH_WATER_TO_REMOVE');

    const logDate = dateParam ? new Date(dateParam) : new Date();
    if (dateParam) logDate.setHours(12, 0, 0, 0);

    return await prisma.waterLog.create({
        data: { userId, amount: -Number(amount), date: logDate }
    });
};