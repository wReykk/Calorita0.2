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

export const removeWaterLog = async (userId: string, amount: number) => {
    if (!amount || amount <= 0) {
        throw new Error('INVALID_AMOUNT');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ищем самую последнюю добавленную запись с таким же объемом за сегодня
    const logToDelete = await prisma.waterLog.findFirst({
        where: {
            userId,
            amount: Number(amount),
            date: {
                gte: today
            }
        },
        orderBy: {
            date: 'desc' // Сортируем от новых к старым, чтобы удалить последнюю
        }
    });

    // Если такой записи нет, ничего не делаем (бросаем ошибку)
    if (!logToDelete) {
        throw new Error('LOG_NOT_FOUND');
    }

    // Удаляем найденную запись
    await prisma.waterLog.delete({
        where: { id: logToDelete.id }
    });

    return true;
};