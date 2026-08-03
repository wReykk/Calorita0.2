import { z } from 'zod';

export const addDiaryEntrySchema = z.object({
    body: z.object({
        productId: z.string({ message: 'Product ID is required.' }),

        amount: z.number().positive({ message: 'Weight must be more than 0.' }),
        productData: z.object({
            name: z.string(),
            calories: z.number(),
            protein: z.number(),
            fat: z.number(),
            carbs: z.number(),
            externalId: z.string(),
            isGlobal: z.boolean()
        }).optional(),

        date: z.string().datetime({ message: 'Wrong date format.' }).optional()
    })
});