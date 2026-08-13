import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string('Name is required')
            .min(3, 'Name must be at least 3 characters long.')
            .max(30, 'Name cannot exceed 30 characters.')
            .regex(/^[a-zA-Z0-9_ -]+$/, 'Name can only contain English letters, numbers, spaces, hyphens, and underscores.')
            .transform(val => val.trim()),

        email: z.string('Email is required')
            .email('Wrong email format.')
            .transform(val => val.toLowerCase().trim()),

        password: z.string('Password is required')
            .min(8, 'Password must contain at least 8 characters.')
            .regex(/^\S+$/, 'Password cannot contain spaces.')
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string('Email is required')
            .email('Wrong email format.')
            .transform(val => val.toLowerCase().trim()),
        password: z.string('Password is required')
            .min(1, 'Wrong password'),
    }),
});