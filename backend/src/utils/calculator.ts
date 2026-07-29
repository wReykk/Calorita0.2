import { Sex, ActivityLevel, Goal, type User } from "@prisma/client"

interface UserParams {
    weight: number,
    height: number,
    age: number,
    sex: Sex,
    activityLevel: ActivityLevel,
    goal: Goal
}

export function calculateMacros(params: UserParams) {
    const { weight, height, age, sex, activityLevel, goal } = params

    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = sex === 'MALE' ? bmr + 5 : bmr - 161;

    const activityMultipliers: Record<ActivityLevel, number> = {
        SEDENTARY: 1.2,
        LIGHT: 1.375,
        MODERATE: 1.55,
        ACTIVE: 1.725,
        VERY_ACTIVE: 1.9,
    }

    let tdee = bmr * activityMultipliers[activityLevel];

    let dailyCalories = tdee;
    if (goal === 'LOSE') {
        dailyCalories *= 0.8;
    } else if (goal === 'GAIN') {
        dailyCalories *= 1.15;
    }

    dailyCalories = Math.round(dailyCalories);

    const dailyProtein = Math.round((dailyCalories * 0.3) / 4);
    const dailyFat = Math.round((dailyCalories * 0.3) / 9);
    const dailyCarbs = Math.round((dailyCalories * 0.4) / 4);

    return {
        dailyCalories,
        dailyProtein,
        dailyFat,
        dailyCarbs
    };
}