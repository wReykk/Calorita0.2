import apiClient from '../assets/api/client'
import type { RecipePayload, Recipe, RecipeDetails } from '../types/recipe.types'

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