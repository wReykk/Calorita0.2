import { type NextFunction, type Response } from 'express';
import { DiaryService } from '../services/diary.service.js';
import { type AuthRequest } from '../middlewares/auth.middleware.js';

const diaryService = new DiaryService();

export class DiaryController {

    public addEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId as string;
            const entry = await diaryService.addEntry(userId, req.body);

            res.status(201).json(entry);
        } catch (error) {
            next(error);
        }
    };

    public getEntries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId as string;
            const entries = await diaryService.getEntries(userId);

            res.status(200).json(entries);
        } catch (error) {
            next(error);
        }
    };

    public updateEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const userId = req.userId as string;
            const weight = typeof req.body.weight === 'number'
                ? req.body.weight
                : typeof req.body.amount === 'number'
                    ? req.body.amount
                    : undefined;

            const updatedEntry = await diaryService.updateEntry(id, userId, { weight });

            if (!updatedEntry) {
                res.status(404).json({ message: 'Diary entry not found' });
                return;
            }

            res.status(200).json(updatedEntry);
        } catch (error) {
            next(error);
        }
    };

    public deleteEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const userId = req.userId as string;

            await diaryService.deleteEntry(id, userId);

            res.status(200).json({ message: 'Запись удалена из дневника' });
        } catch (error) {
            next(error);
        }
    };

    public getDailySummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId as string;
            const { date } = req.query;

            const summary = await diaryService.getDailySummary(userId, date as string);

            res.status(200).json(summary);
        } catch (error) {
            next(error);
        }
    };
}