import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'Access denied. No token' });
            return;
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({ error: 'Wrong header format.' });
            return;
        }

        const token = parts[1] as string;

        const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: string };

        req.userId = decoded.userId;

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};