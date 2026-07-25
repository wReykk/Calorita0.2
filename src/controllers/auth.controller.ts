import { type Request, type Response, type NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

export class AuthController {
    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await authService.register(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    };

    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await authService.login(req.body);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}