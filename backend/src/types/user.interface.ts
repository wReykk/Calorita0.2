import type { Sex, ActivityLevel, Goal, Pace } from '@prisma/client';

export interface MacrosResult {
    dailyCalories: number;
    dailyProtein: number;
    dailyFat: number;
    dailyCarbs: number;
}

export interface UpdateUserParams {
    weight: number;
    height: number;
    dateOfBirth: string | Date;
    sex: Sex;
    activityLevel: ActivityLevel;
    goal: Goal;
    pace: Pace;
    targetWeight?: number | null;
}