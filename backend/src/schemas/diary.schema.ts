import { z } from 'zod';

export const addDiaryEntrySchema = z.object({
    body: z.object({
        productId: z.string().uuid({ message: 'Wrong product ID format.' }),
        amount: z.number().positive({ message: 'Weight must be more than 0.' }),
        date: z.string().datetime({ message: 'Wrond date format.' }).optional()
    })
});