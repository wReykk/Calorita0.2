import { Router, type RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as water from '../controllers/water.controller.js';

const router = Router();

router.get('/today', authenticate, water.getWater as RequestHandler);
router.post('/', authenticate, water.addWater as RequestHandler);
router.delete('/:amount', authenticate, water.deleteWater as RequestHandler);

export default router;