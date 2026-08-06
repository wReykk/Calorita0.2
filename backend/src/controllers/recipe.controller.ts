import type { Request, Response } from 'express';
import { RecipeService } from '../services/recipe.service.js';
import { type AuthRequest } from '../middlewares/auth.middleware.js';

const recipeService = new RecipeService();

export class RecipeController {
    public async createRecipe(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;

            if (!userId) {
                res.status(401).json({ message: 'You are not authorized' });
                return;
            }

            const { name, totalWeight, ingredients } = req.body;

            // Базовая валидация
            if (!name || !totalWeight || !ingredients || !Array.isArray(ingredients)) {
                res.status(400).json({ message: 'Incorrect data for recipe.' });
                return;
            }

            // Вызываем наш сервис
            const recipe = await recipeService.createRecipe(userId, {
                name,
                totalWeight,
                ingredients
            });

            res.status(201).json(recipe);
        } catch (error: any) {
            console.error('Ошибка при создании рецепта:', error);
            res.status(500).json({ message: error.message || 'Server error while creating recipe' });
        }
    }

    public async getUserRecipes(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) { res.status(401).json({ message: 'You are not authorized' }); return; }

            const recipes = await recipeService.getUserRecipes(userId);
            res.status(200).json(recipes);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    public async getRecipeById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) { res.status(401).json({ message: 'You are not authorized' }); return; }

            const recipe = await recipeService.getRecipeById(req.params.id as string, userId);
            res.status(200).json(recipe);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    public async updateRecipe(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) { res.status(401).json({ message: 'You are not authorized' }); return; }

            const { name, totalWeight, ingredients } = req.body;
            if (!name || !totalWeight || !ingredients) {
                res.status(400).json({ message: 'Incorrect data' });
                return;
            }

            const updatedRecipe = await recipeService.updateRecipe(req.params.id as string, userId, { name, totalWeight, ingredients });
            res.status(200).json(updatedRecipe);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}