import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTodayWaterIntake = async (userId: string) => {
    // Определяем начало и конец сегодняшнего дня (от 00:00 до 23:59)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ищем все записи пользователя за сегодня
    const logs = await prisma.waterLog.findMany({
        where: {
            userId,
            date: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    // Считаем общую сумму миллилитров
    const total = logs.reduce((sum, log) => sum + log.amount, 0);

    return total;
};

export const addWaterLog = async (userId: string, amount: number) => {
    if (!amount || amount <= 0) {
        throw new Error('INVALID_AMOUNT');
    }

    const newLog = await prisma.waterLog.create({
        data: {
            userId,
            amount: Number(amount)
        }
    });

    return newLog;
};