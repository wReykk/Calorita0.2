import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// router.get('/test', (req, res) => res.send('router is working!'));

router.patch('/:id/parameters', userController.updateParameters);

export default router;