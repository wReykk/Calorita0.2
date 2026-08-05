import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
const recipeController = new RecipeController();

router.post('/', authenticate, recipeController.createRecipe.bind(recipeController));
router.get('/', authenticate, recipeController.getUserRecipes.bind(recipeController));
router.get('/:id', authenticate, recipeController.getRecipeById.bind(recipeController));
router.put('/:id', authenticate, recipeController.updateRecipe.bind(recipeController));

export default router;