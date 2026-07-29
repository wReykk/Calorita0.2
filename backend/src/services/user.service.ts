import { PrismaClient } from '@prisma/client';
import { calculateMacros } from '../utils/calculator.js';

const prisma = new PrismaClient();

const calculateAge = (dob: string | Date) => {
    const diffMs = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const updateUserParameters = async (id: string, data: any) => {
    const { weight, height, dateOfBirth, sex, activityLevel, goal } = data;

    if (!weight || !height || !dateOfBirth || !sex || !activityLevel || !goal) {
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
    });

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            weight: Number(weight),
            height: Number(height),
            dateOfBirth: new Date(dateOfBirth),
            sex,
            activityLevel,
            goal,
            dailyCalories: macros.dailyCalories,
            dailyProtein: macros.dailyProtein,
            dailyFat: macros.dailyFat,
            dailyCarbs: macros.dailyCarbs,
        },
    });

    return updatedUser;
};