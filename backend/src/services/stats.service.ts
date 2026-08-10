import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNutritionalStats = async (userId: string) => {
    // 1. Достаем дату регистрации, чтобы корректно считать среднее для новых юзеров
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true }
    });

    if (!user) throw new Error('User not found');

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // 2. Считаем, сколько дней юзер с нами (минимум 1)
    const daysSinceReg = Math.max(1, Math.ceil((today.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)));

    // Делители для среднего значения
    const weeklyDivisor = Math.min(7, daysSinceReg);
    const monthlyDivisor = Math.min(30, daysSinceReg);

    // 3. Достаем все записи из дневника за последние 30 дней
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
            carbs: true
        }
    });

    const waterLogs = await prisma.waterLog.findMany({
        where: {
            userId,
            date: { gte: thirtyDaysAgo }
        },
        select: { date: true, amount: true }
    });

    const weeklySum = { calories: 0, protein: 0, fat: 0, carbs: 0, water: 0 }; // добавили water
    const monthlySum = { calories: 0, protein: 0, fat: 0, carbs: 0, water: 0 }; // добавили water

    waterLogs.forEach(log => {
        const logDate = new Date(log.date);
        monthlySum.water += log.amount;

        if (logDate >= sevenDaysAgo) {
            weeklySum.water += log.amount;
        }
    });

    entries.forEach(entry => {
        const entryDate = new Date(entry.date);

        // Плюсуем в месяц
        monthlySum.calories += entry.calories;
        monthlySum.protein += entry.protein;
        monthlySum.fat += entry.fat;
        monthlySum.carbs += entry.carbs;

        // Если запись была в последние 7 дней, плюсуем еще и в неделю
        if (entryDate >= sevenDaysAgo) {
            weeklySum.calories += entry.calories;
            weeklySum.protein += entry.protein;
            weeklySum.fat += entry.fat;
            weeklySum.carbs += entry.carbs;
        }
    });

    // 5. Возвращаем готовые средние значения
    return {
        weekly: {
            calories: Math.round(weeklySum.calories / weeklyDivisor),
            protein: Math.round(weeklySum.protein / weeklyDivisor),
            fat: Math.round(weeklySum.fat / weeklyDivisor),
            carbs: Math.round(weeklySum.carbs / weeklyDivisor),
            water: Math.round(weeklySum.water / weeklyDivisor), // добавили
        },
        monthly: {
            calories: Math.round(monthlySum.calories / monthlyDivisor),
            protein: Math.round(monthlySum.protein / monthlyDivisor),
            fat: Math.round(monthlySum.fat / monthlyDivisor),
            carbs: Math.round(monthlySum.carbs / monthlyDivisor),
            water: Math.round(monthlySum.water / monthlyDivisor), // добавили
        }
    };
};