import { Router } from 'express';
import * as recipeController from '../controllers/recipe.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, recipeController.createRecipe.bind(recipeController));
router.get('/', authenticate, recipeController.getUserRecipes.bind(recipeController));
router.get('/:id', authenticate, recipeController.getRecipeById.bind(recipeController));
router.put('/:id', authenticate, recipeController.updateRecipe.bind(recipeController));
router.delete('/:id', authenticate, recipeController.deleteRecipe.bind(recipeController));

export default router;