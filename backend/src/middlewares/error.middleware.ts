import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error(`[Server Error]:`, err);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: 'Something went wrong',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};