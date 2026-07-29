import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';

export const updateParameters = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        const updatedUser = await userService.updateUserParameters(id, req.body);

        res.status(200).json({
            success: true,
            message: 'Parameters are updated successfully',
            user: updatedUser,
        });
    } catch (error: any) {
        console.error('Error in userController:', error);

        if (error.message === 'MISSING_DATA') {
            return res.status(400).json({ error: 'Fill everything.' });
        }

        res.status(500).json({ error: 'Server error.' });
    }
};