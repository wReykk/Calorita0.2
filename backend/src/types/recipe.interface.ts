export interface IngredientInput {
    productId: string;
    amount: number;
    name?: string;
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    pieceName?: string;
}

export interface Recipe {
    id: number;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}