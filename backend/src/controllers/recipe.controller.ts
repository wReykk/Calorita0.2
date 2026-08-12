import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as recipeService from '../services/recipe.service.js';

export const createRecipe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const { name, totalWeight, ingredients } = req.body;

        if (!name || !totalWeight || !ingredients || !Array.isArray(ingredients)) {
            res.status(400).json({ message: 'Incorrect data for recipe.' });
            return;
        }

        const recipe = await recipeService.createRecipe(userId, {
            name,
            totalWeight,
            ingredients
        });

        res.status(201).json(recipe);
    } catch (error) {
        next(error);
    }
};

export const getUserRecipes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const recipes = await recipeService.getUserRecipes(userId);

        res.status(200).json(recipes);
    } catch (error) {
        next(error);
    }
};

export const getRecipeById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const recipeId = req.params.id as string;

        const recipe = await recipeService.getRecipeById(recipeId, userId);

        res.status(200).json(recipe);
    } catch (error) {
        next(error);
    }
};

export const updateRecipe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const recipeId = req.params.id as string;
        const { name, totalWeight, ingredients } = req.body;

        if (!name || !totalWeight || !ingredients) {
            res.status(400).json({ message: 'Incorrect data' });
            return;
        }

        const updatedRecipe = await recipeService.updateRecipe(recipeId, userId, {
            name,
            totalWeight,
            ingredients
        });

        res.status(200).json(updatedRecipe);
    } catch (error) {
        next(error);
    }
};

export const deleteRecipe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const recipeId = req.params.id as string;

        await recipeService.deleteRecipe(recipeId, userId);

        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        next(error);
    }
};