import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as userService from '../services/user.service.js';
import { checkAndUpdateStreak } from '../services/streak.service.js';
import { getNutritionalStats } from '../services/stats.service.js';

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId as string;

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
        if (error.message === 'USER_NOT_FOUND') {
            res.status(404).json({ error: 'User not found.' });
            return;
        }

        next(error);
    }
};

export const updateParameters = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;

        const updatedUser = await userService.updateUserParameters(id, req.body);
        const { estimatedWeeksToGoal, ...userData } = updatedUser;

        res.status(200).json({
            success: true,
            message: 'Parameters are updated successfully',
            user: userData,
            estimatedWeeksToGoal,
        });
    } catch (error: any) {
        if (error.message === 'MISSING_DATA') {
            res.status(400).json({ error: 'Fill everything.' });
            return;
        }
        if (error.message === 'INVALID_WEIGHT_GAIN') {
            res.status(400).json({ error: 'Target weight must be higher than current weight for GAIN goal.' });
            return;
        }
        if (error.message === 'INVALID_WEIGHT_LOSE') {
            res.status(400).json({ error: 'Target weight must be lower than current weight for LOSE goal.' });
            return;
        }

        next(error);
    }
};