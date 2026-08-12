import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { getTodayWaterIntake, addWaterLog, removeWaterLog } from '../services/water.service.js';

export const getWater = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const date = req.query.date as string;
        const total = await getTodayWaterIntake(userId, date);
        res.json({ total });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch water data' });
    }
}

export const addWater = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { amount, date } = req.body;

        await addWaterLog(userId, amount, date);

        const newTotal = await getTodayWaterIntake(userId, date);
        res.json({ success: true, total: newTotal });
    } catch (error) {
        res.status(400).json({ error: 'Failed to add water' });
    }
}

export const deleteWater = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const amount = Number(req.params.amount);
        const date = req.query.date as string;

        await removeWaterLog(userId, amount, date);

        const newTotal = await getTodayWaterIntake(userId, date);
        res.json({ success: true, total: newTotal });
    } catch (error) {
        res.status(400).json({ error: 'Failed to remove water' });
    }
}