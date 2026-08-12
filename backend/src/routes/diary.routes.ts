import { Router, type RequestHandler } from 'express';
import * as diaryController from '../controllers/diary.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { addDiaryEntrySchema } from '../schemas/diary.schema.js';

const router = Router();

router.use(authenticate as RequestHandler);

router.get('/summary', diaryController.getDailySummary as RequestHandler);
router.get('/', diaryController.getEntries as RequestHandler);
router.post('/', validate(addDiaryEntrySchema), diaryController.addEntry as RequestHandler);
router.put('/:id', diaryController.updateEntry as RequestHandler);
router.delete('/:id', diaryController.deleteEntry as RequestHandler);

export default router;