import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Wrong email format.'),
        password: z.string().min(6, 'Password must contain at least 6 characters.'),
        name: z.string().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Wrong email format.'),
        password: z.string().min(1, 'Wrong password'),
    }),
});