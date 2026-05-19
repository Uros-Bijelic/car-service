import { DrizzleQueryError } from 'drizzle-orm';
import type { ErrorRequestHandler } from 'express';
import {
    AppError,
    ConflictError,
    DatabaseError,
    ValidationError
} from './AppError.js';
import { DatabaseError as PgError } from 'pg';

const HTTP = {
    UNPROCESSABLE: 422,
    CONFLICT: 409,
    UNAVAILABLE: 503
} as const;

const PG_ERROR_MAP: Record<string, { status: number; message: string }> = {
    // ── Integrity ──────────────────────────────────────────────────────────────
    '23505': { status: HTTP.CONFLICT, message: 'Resource already exists' },
    '23503': {
        status: HTTP.UNPROCESSABLE,
        message: 'Referenced record does not exist'
    },
    '23502': {
        status: HTTP.UNPROCESSABLE,
        message: 'Required field is missing'
    },
    '23514': {
        status: HTTP.UNPROCESSABLE,
        message: 'Value failed a check constraint'
    },
    '23P01': {
        status: HTTP.CONFLICT,
        message: 'Overlapping values not allowed'
    },

    // ── Connection ─────────────────────────────────────────────────────────────
    '08006': { status: HTTP.UNAVAILABLE, message: 'Database is unavailable' },
    '08001': { status: HTTP.UNAVAILABLE, message: 'Database is unavailable' },
    '57P03': { status: HTTP.UNAVAILABLE, message: 'Database is unavailable' },
    '08P01': { status: HTTP.UNAVAILABLE, message: 'Database protocol error' },

    // ── Auth ───────────────────────────────────────────────────────────────────
    '28000': {
        status: HTTP.UNAVAILABLE,
        message: 'Database authentication failed'
    },
    '28P01': {
        status: HTTP.UNAVAILABLE,
        message: 'Database authentication failed'
    },

    // ── Query / Data ───────────────────────────────────────────────────────────
    '22P02': {
        status: HTTP.UNPROCESSABLE,
        message: 'Invalid ID or enum format'
    },
    '22003': { status: HTTP.UNPROCESSABLE, message: 'Number out of range' },
    '22001': {
        status: HTTP.UNPROCESSABLE,
        message: 'Value exceeds maximum length'
    },
    '42703': {
        status: HTTP.UNAVAILABLE,
        message: 'Schema mismatch — run migrations'
    },
    '42P01': {
        status: HTTP.UNAVAILABLE,
        message: 'Schema mismatch — run migrations'
    },

    // ── Transactions ───────────────────────────────────────────────────────────
    '40001': {
        status: HTTP.UNAVAILABLE,
        message: 'Transaction conflict — please retry'
    },
    '40P01': {
        status: HTTP.UNAVAILABLE,
        message: 'Transaction conflict — please retry'
    },
    '25P02': { status: HTTP.UNAVAILABLE, message: 'Transaction aborted' }
};

const toAppError = (status: number, message: string): AppError => {
    if (status === HTTP.CONFLICT) return new ConflictError(message);
    if (status === HTTP.UNPROCESSABLE) return new ValidationError(message);
    if (status === HTTP.UNAVAILABLE) return new DatabaseError(message);
    return new AppError(message, status);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    let appError: AppError | Error = err;

    if (
        err instanceof DrizzleQueryError &&
        err.cause instanceof PgError &&
        err.cause.code
    ) {
        const mappedError = PG_ERROR_MAP[err.cause.code];
        appError = toAppError(
            mappedError?.status ?? HTTP.UNAVAILABLE,
            mappedError?.message ?? 'Database query failed'
        );
    }

    if (appError instanceof AppError) {
        return res.status(appError.statusCode).json({
            message: appError.message
        });
    }

    console.error('Unhandled error:', appError);
    return res.status(500).json({
        message: 'Internal server error'
    });
};
