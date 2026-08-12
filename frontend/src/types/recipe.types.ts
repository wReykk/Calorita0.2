export type ProductOption = {
    id: string
    name: string
    calories?: number | null
    protein?: number | null
    fat?: number | null
    carbs?: number | null
    externalId?: string
    servingDescription?: string | null
    description?: string
    isGlobal?: boolean
    pieceName?: string | null
}

export type Ingredient = ProductOption & {
    productId: string
    amount: number
}

export type IngredientInput = {
    productId: string
    amount: number
}

export type RecipePayload = {
    name: string
    totalWeight: number
    ingredients: IngredientInput[]
}

export type Recipe = {
    id: string
    name: string
    calories: number
    protein: number | null
    fat: number | null
    carbs: number | null
    totalWeight?: number
}

export type RecipeIngredient = {
    ingredientId: string
    amount: number
    ingredient?: {
        name: string
        calories?: number | null
        protein?: number | null
        fat?: number | null
        carbs?: number | null
        pieceName?: string | null
    }
}

export type RecipeDetails = Recipe & {
    recipeIngredients: RecipeIngredient[]
}