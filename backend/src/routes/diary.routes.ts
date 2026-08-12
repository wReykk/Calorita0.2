import { Router } from 'express';
import * as diaryController from '../controllers/diary.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { addDiaryEntrySchema } from '../schemas/diary.schema.js';

const router = Router();

router.use(authenticate);

router.get('/summary', diaryController.getDailySummary);
router.get('/', diaryController.getEntries);
router.post('/', validate(addDiaryEntrySchema), diaryController.addEntry);
router.put('/:id', diaryController.updateEntry);
router.delete('/:id', diaryController.deleteEntry);

export default router;