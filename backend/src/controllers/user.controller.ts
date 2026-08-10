import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as userService from '../services/user.service.js';
import { checkAndUpdateStreak } from '../services/streak.service.js';
import { getNutritionalStats } from '../services/stats.service.js';

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Access denied. No token' });
        }

        await checkAndUpdateStreak(userId);

        const [user, stats] = await Promise.all([
            userService.getUserById(userId),
            getNutritionalStats(userId)
        ]);

        res.status(200).json({
            success: true,
            user,
            stats
        });
    } catch (error: any) {
        console.error('Error in userController:', error);

        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(500).json({ error: 'Server error.' });
    }
};

export const updateParameters = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        const updatedUser = await userService.updateUserParameters(id, req.body);
        const { estimatedWeeksToGoal, ...userData } = updatedUser;

        res.status(200).json({
            success: true,
            message: 'Parameters are updated successfully',
            user: userData,
            estimatedWeeksToGoal,
        });
    } catch (error: any) {
        console.error('Error in userController:', error);

        if (error.message === 'MISSING_DATA') {
            return res.status(400).json({ error: 'Fill everything.' });
        }

        res.status(500).json({ error: 'Server error.' });
    }
};