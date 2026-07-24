import { z } from 'zod';

export const createProductSchema = z.object({
    body: z.object({
        name: z.string({
            error: (issue) => issue.input === undefined
                ? 'Name is required'
                : 'Name must be a string',
        }).min(2, 'Name must be at least 2 characters long'),

        calories: z.number({
            error: (issue) => issue.input === undefined
                ? 'Calories are required'
                : 'Calories must be a number',
        }).min(0, 'Calories cannot be negative'),

        protein: z.number().min(0, 'Protein cannot be negative'),
        fat: z.number().min(0, 'Fat cannot be negative'),
        carbs: z.number().min(0, 'Carbs cannot be negative'),
    }),
});

export const updateProductSchema = z.object({
    body: createProductSchema.shape.body.partial(),
});