import apiClient from '../assets/api/client'

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

export const recipeService = {
    createRecipe: async (payload: RecipePayload) => {
        const response = await apiClient.post<Recipe>('/recipes', payload)
        return response.data
    },

    getRecipes: async () => {
        const response = await apiClient.get<Recipe[]>('/recipes')
        return response.data
    },

    getRecipe: async (id: string) => {
        const response = await apiClient.get<RecipeDetails>(`/recipes/${id}`)
        return response.data
    },

    updateRecipe: async (id: string, payload: RecipePayload) => {
        const response = await apiClient.put<RecipeDetails>(`/recipes/${id}`, payload)
        return response.data
    },

    deleteRecipe: async (id: string) => {
        const response = await apiClient.delete(`/recipes/${id}`)
        return response.data
    }
}