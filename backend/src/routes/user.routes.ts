
import { Router, type RequestHandler } from 'express'; import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', authenticate as RequestHandler, userController.getCurrentUser as RequestHandler);
router.patch('/:id/parameters', userController.updateParameters as RequestHandler);

export default router;