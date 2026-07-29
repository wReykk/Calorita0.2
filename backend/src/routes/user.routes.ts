import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.patch('/:id/parameters', userController.updateParameters);

export default router;