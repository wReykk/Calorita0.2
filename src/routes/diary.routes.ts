import { Router } from 'express';
import { DiaryController } from '../controllers/diary.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { addDiaryEntrySchema } from '../schemas/diary.schema.js';

const router = Router();
const controller = new DiaryController();

router.use(authenticate);

router.get('/summary', controller.getDailySummary);

router.get('/', controller.getEntries);

router.post('/', validate(addDiaryEntrySchema), controller.addEntry);

router.delete('/:id', controller.deleteEntry);

export default router;