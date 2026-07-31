import { z } from 'zod';
import { Sex, ActivityLevel, Goal, Pace } from '@prisma/client';

export const updateUserParamsSchema = z.object({
    body: z.object({
        weight: z.number().min(20, 'Weight must be at least 20 kg').max(300, 'Weight is too high'),
        targetWeight: z.number().min(20).max(300).optional().nullable(),
        height: z.number().min(100, 'Height must be at least 100 cm').max(250, 'Height is too high'),
        dateOfBirth: z.string(),
        sex: z.nativeEnum(Sex, { message: 'Invalid sex' }),
        activityLevel: z.nativeEnum(ActivityLevel, { message: 'Invalid activity level' }),
        goal: z.nativeEnum(Goal, { message: 'Invalid goal' }),
        pace: z.nativeEnum(Pace, { message: 'Invalid pace' }),
    }),
});