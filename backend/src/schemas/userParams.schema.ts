import { z } from 'zod';
import { Sex, ActivityLevel, Goal, Pace } from '@prisma/client';

export const updateUserParamsSchema = z.object({
    body: z.object({
        weight: z.number().min(20).max(300),
        height: z.number().min(100).max(250),
        targetWeight: z.number().optional().nullable(),
        dateOfBirth: z.string(),
        sex: z.nativeEnum(Sex, { message: 'Invalid sex' }),
        activityLevel: z.nativeEnum(ActivityLevel, { message: 'Invalid activity level' }),
        goal: z.nativeEnum(Goal, { message: 'Invalid goal' }),
        pace: z.nativeEnum(Pace, { message: 'Invalid pace' }),
    }).superRefine((data, ctx) => {
        if (data.targetWeight && data.height) {
            const heightInMeters = data.height / 100;

            const minHealthyWeight = Math.ceil(18.5 * (heightInMeters * heightInMeters));
            const maxHealthyWeight = Math.floor(30 * (heightInMeters * heightInMeters));

            if (data.targetWeight < minHealthyWeight) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['targetWeight'],
                    message: `Minimum safe weight for your height is ${Math.round(minHealthyWeight)} kg.`,
                });
            }

            if (data.targetWeight > maxHealthyWeight) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['targetWeight'],
                    message: `Maximum safe weight for your height is ${Math.round(minHealthyWeight)} kg.`,
                });
            }
        }
    }),
});