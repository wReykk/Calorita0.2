import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as water from '../controllers/water.controller.js';

const router = Router();

router.get('/today', authenticate, water.getWater);
router.post('/', authenticate, water.addWater);
router.delete('/:amount', authenticate, water.deleteWater);

export default router;