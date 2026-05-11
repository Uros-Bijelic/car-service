import type { Request, Response, NextFunction } from 'express';
import { type ZodType, ZodError } from 'zod';

export const validateBody = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (e: unknown) {
            if (e instanceof ZodError) {
                const errorDetails = e.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    error: 'Validation fails!',
                    errorDetails
                });
            }
            next(e);
        }
    };
};

export const validateParams = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.params);
            next();
        } catch (e: unknown) {
            if (e instanceof ZodError) {
                const errorDetails = e.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    error: 'Invalid params!',
                    errorDetails
                });
            }
            next(e);
        }
    };
};
export const validateQuery = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.query);
            next();
        } catch (e: unknown) {
            if (e instanceof ZodError) {
                const errorDetails = e.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    error: 'Invalid query params!',
                    errorDetails
                });
            }
            next(e);
        }
    };
};
