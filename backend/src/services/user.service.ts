import { PrismaClient } from '@prisma/client';
import { calculateMacros } from '../utils/calculator.js';

const prisma = new PrismaClient();

const calculateAge = (dob: string | Date) => {
    const diffMs = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            dateOfBirth: true,
            sex: true,
            height: true,
            weight: true,
            activityLevel: true,
            goal: true,
            targetWeight: true,
            pace: true,
            dailyCalories: true,
            dailyProtein: true,
            dailyFat: true,
            dailyCarbs: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    return {
        ...user,
        targetWeight: user.targetWeight ?? null,
    };
};

export const updateUserParameters = async (id: string, data: any) => {
    const { weight, height, dateOfBirth, sex, activityLevel, goal, pace, targetWeight } = data;

    if (!weight || !height || !dateOfBirth || !sex || !activityLevel || !goal || !pace) {
        throw new Error('MISSING_DATA');
    }

    const age = calculateAge(dateOfBirth);

    const macros = calculateMacros({
        weight: Number(weight),
        height: Number(height),
        age,
        sex,
        activityLevel,
        goal,
        pace,
        targetWeight: targetWeight ? Number(targetWeight) : null
    });

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            weight: Number(weight),
            targetWeight: targetWeight ? Number(targetWeight) : null,
            height: Number(height),
            dateOfBirth: new Date(dateOfBirth),
            sex,
            activityLevel,
            goal,
            pace,
            dailyCalories: macros.dailyCalories,
            dailyProtein: macros.dailyProtein,
            dailyFat: macros.dailyFat,
            dailyCarbs: macros.dailyCarbs,
            weightLogs: {
                create: {
                    weight: Number(weight)
                }
            }
        },
    });

    return {
        ...updatedUser,
        targetWeight: updatedUser.targetWeight ?? null,
        estimatedWeeksToGoal: macros.estimatedWeeksToGoal
    };
};