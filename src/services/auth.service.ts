import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import type { z } from 'zod';
import type { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;

type RegisterInput = z.infer<typeof registerSchema>['body'];
type LoginInput = z.infer<typeof loginSchema>['body'];

export class AuthService {
    public async register(data: RegisterInput) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error('User with this email already exists.');
        }


        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
        });

        const { password, ...userWithoutPassword } = newUser;

        return userWithoutPassword;
    }

    public async login(data: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new Error('Wrong email or password');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Wrong email or password');
        }

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token
        };
    }
}