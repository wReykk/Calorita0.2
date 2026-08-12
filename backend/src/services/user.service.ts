import { prisma } from '../prisma/prisma.config.js';
import { calculateMacros } from '../utils/calculator.js';
import { calculateAge } from '../utils/date.js';
import type { UpdateUserParams } from '../types/user.interface.js';

export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true, email: true, name: true, dateOfBirth: true, sex: true,
            height: true, weight: true, activityLevel: true, goal: true,
            targetWeight: true, pace: true, dailyCalories: true, dailyProtein: true,
            dailyFat: true, dailyCarbs: true, createdAt: true, updatedAt: true,
            currentStreak: true, longestStreak: true, lastActiveDate: true,
            weightLogs: {
                orderBy: { date: 'asc' },
                select: { weight: true, date: true, id: true }
            }
        },
    });

    if (!user) throw new Error('USER_NOT_FOUND');

    return { ...user, targetWeight: user.targetWeight ?? null };
};

export const updateUserParameters = async (id: string, data: UpdateUserParams) => {
    const { weight, height, dateOfBirth, sex, activityLevel, goal, pace } = data;
    let finalTargetWeight = data.targetWeight;

    if (!weight || !height || !dateOfBirth || !sex || !activityLevel || !goal || !pace) {
        throw new Error('MISSING_DATA');
    }

    if (weight && finalTargetWeight && goal) {
        if (goal === 'GAIN' && finalTargetWeight <= weight) throw new Error('INVALID_WEIGHT_GAIN');
        if (goal === 'LOSE' && finalTargetWeight >= weight) throw new Error('INVALID_WEIGHT_LOSE');
    }

    if (goal === 'MAINTAIN') finalTargetWeight = weight;

    const age = calculateAge(dateOfBirth); // Используем утилиту

    const macros = calculateMacros({
        weight: Number(weight), height: Number(height), age, sex,
        activityLevel, goal, pace, targetWeight: finalTargetWeight ? Number(finalTargetWeight) : null
    });

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            weight: Number(weight), targetWeight: finalTargetWeight ? Number(finalTargetWeight) : null,
            height: Number(height), dateOfBirth: new Date(dateOfBirth), sex,
            activityLevel, goal, pace, dailyCalories: macros.dailyCalories,
            dailyProtein: macros.dailyProtein, dailyFat: macros.dailyFat, dailyCarbs: macros.dailyCarbs,
            weightLogs: { create: { weight: Number(weight) } }
        },
    });

    return { ...updatedUser, targetWeight: updatedUser.targetWeight ?? null, estimatedWeeksToGoal: macros.estimatedWeeksToGoal };
};