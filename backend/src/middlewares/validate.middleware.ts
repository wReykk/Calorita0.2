import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny) =>
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: 'Validation failed',
                    errors: error.issues,
                });
                return;
            }

            res.status(500).json({ message: 'Internal server error' });
        }
    };