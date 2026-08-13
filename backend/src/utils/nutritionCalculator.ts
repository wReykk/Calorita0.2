type NutritionBase = {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
};

export const calculateNutrition = (
    baseNutrition: NutritionBase,
    amount: number,
    isPiece: boolean
) => {
    const multiplier = isPiece ? amount : amount / 100;

    return {
        calories: Number((baseNutrition.calories * multiplier).toFixed(2)),
        protein: Number((baseNutrition.protein * multiplier).toFixed(2)),
        fat: Number((baseNutrition.fat * multiplier).toFixed(2)),
        carbs: Number((baseNutrition.carbs * multiplier).toFixed(2)),
    };
};