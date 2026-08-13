import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as waterService from '../services/water.service.js';

export const getWater = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const date = req.query.date as string;

        const total = await waterService.getTodayWaterIntake(userId, date);

        res.status(200).json({ total });
    } catch (error) {
        next(error);
    }
};

export const addWater = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const { amount, date } = req.body;

        await waterService.addWaterLog(userId, amount, date);

        const newTotal = await waterService.getTodayWaterIntake(userId, date);

        res.status(200).json({ success: true, total: newTotal });
    } catch (error: any) {
        if (error.message === 'INVALID_AMOUNT') {
            res.status(400).json({ error: 'Invalid water amount' });
            return;
        }

        next(error);
    }
};

export const deleteWater = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId
        const amount = Number(req.params.amount);
        const date = req.query.date as string;

        await waterService.removeWaterLog(userId, amount, date);

        const newTotal = await waterService.getTodayWaterIntake(userId, date);

        res.status(200).json({ success: true, total: newTotal });
    } catch (error: any) {
        if (error.message === 'INVALID_AMOUNT') {
            res.status(400).json({ error: 'Invalid water amount' });
            return;
        }
        if (error.message === 'NOT_ENOUGH_WATER_TO_REMOVE') {
            res.status(400).json({ error: 'Not enough water to remove' });
            return;
        }

        next(error);
    }
};