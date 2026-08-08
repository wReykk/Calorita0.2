import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { getTodayWaterIntake, addWaterLog, removeWaterLog } from '../services/water.service.js';

export const getWater = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: 'You are not authorized' });
            return;
        }

        const total = await getTodayWaterIntake(userId as string);
        res.json({ total });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch water data' });
    }
}

export const addWater = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: 'You are not authorized' });
            return;
        }

        const { amount } = req.body;

        await addWaterLog(userId, amount);

        const newTotal = await getTodayWaterIntake(userId);
        res.json({ success: true, total: newTotal });
    } catch (error) {
        res.status(400).json({ error: 'Failed to add water' });
    }
}

export const deleteWater = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const amount = Number(req.params.amount);

        await removeWaterLog(userId, amount);

        const newTotal = await getTodayWaterIntake(userId);
        res.json({ success: true, total: newTotal });
    } catch (error) {
        res.status(400).json({ error: 'Failed to remove water or no matching record found' });
    }
}