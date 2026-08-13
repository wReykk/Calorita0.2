import { Router, type RequestHandler } from 'express';
import * as recipeController from '../controllers/recipe.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate as RequestHandler);

router.post('/', recipeController.createRecipe.bind(recipeController) as RequestHandler);
router.get('/', recipeController.getUserRecipes.bind(recipeController) as RequestHandler);
router.get('/:id', recipeController.getRecipeById.bind(recipeController) as RequestHandler);
router.put('/:id', recipeController.updateRecipe.bind(recipeController) as RequestHandler);
router.delete('/:id', recipeController.deleteRecipe.bind(recipeController) as RequestHandler);

export default router;