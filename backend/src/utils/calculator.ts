import { Sex, ActivityLevel, Goal, Pace } from "@prisma/client"

interface UserParams {
    weight: number,
    height: number,
    age: number,
    sex: Sex,
    activityLevel: ActivityLevel,
    goal: Goal,
    pace: Pace,
    targetWeight?: number
}

export function calculateMacros(params: UserParams) {
    const { weight, height, age, sex, activityLevel, goal, pace, targetWeight } = params

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
        const loseMultipliers: Record<Pace, number> = {
            EASY: 0.9,
            MEDIUM: 0.8,
            HARD: 0.7,
        };
        dailyCalories *= loseMultipliers[pace];

        if (dailyCalories < 1200) dailyCalories = 1200;

    } else if (goal === 'GAIN') {
        const gainMultipliers: Record<Pace, number> = {
            EASY: 1.075,
            MEDIUM: 1.15,
            HARD: 1.25,
        };
        dailyCalories *= gainMultipliers[pace];
    }

    dailyCalories = Math.round(dailyCalories);

    const dailyProtein = Math.round((dailyCalories * 0.3) / 4);
    const dailyFat = Math.round((dailyCalories * 0.3) / 9);
    const dailyCarbs = Math.round((dailyCalories * 0.4) / 4);

    let estimatedWeeksToGoal: number | null = null

    if (targetWeight && targetWeight !== weight && goal !== 'MAINTAIN') {
        const dailyDiff = Math.abs(tdee - dailyCalories)

        if (dailyDiff > 0) {
            const weightDiff = Math.abs(weight - targetWeight);

            const totalCaloriesDiff = weightDiff * 7700;

            const totalDays = totalCaloriesDiff / dailyDiff;

            estimatedWeeksToGoal = Math.ceil(totalDays / 7);
        }
    }



    return {
        dailyCalories,
        dailyProtein,
        dailyFat,
        dailyCarbs,
        estimatedWeeksToGoal
    };
}