import type { Request, Response, NextFunction } from 'express';
import { type ZodType, ZodError } from 'zod';

const formatErrorDetails = (error: ZodError) => {
    return error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
    }));
};

export const validateBody = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: 'Validation fails!',
                errorDetails: formatErrorDetails(result.error)
            });
        }

        req.body = result.data;

        next();
    };
};

export const validateParams = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            return res.status(400).json({
                message: 'Invalid params!',
                errorDetails: formatErrorDetails(result.error)
            });
        }

        req.params = result.data as typeof req.params;

        next();
    };
};
