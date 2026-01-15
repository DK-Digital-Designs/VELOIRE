import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { ZodError } from 'zod';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('[Error Handler]', err);

    // Handle Zod Validation Errors
    if (err instanceof ZodError) {
        const details = err.errors.reduce((acc: any, curr) => {
            acc[curr.path.join('.')] = curr.message;
            return acc;
        }, {});

        return sendError(
            res,
            'Validation failed',
            'ERR_VALIDATION',
            details,
            400
        );
    }

    // Handle Authentication Errors
    if (err.name === 'UnauthorizedError' || err.code === 'ERR_AUTH_UNAUTHORIZED') {
        return sendError(
            res,
            err.message || 'Unauthorized',
            'ERR_AUTH_UNAUTHORIZED',
            undefined,
            401
        );
    }

    // Handle Forbidden Errors
    if (err.code === 'ERR_AUTH_FORBIDDEN') {
        return sendError(
            res,
            err.message || 'Forbidden',
            'ERR_AUTH_FORBIDDEN',
            undefined,
            403
        );
    }

    // Handle Not Found Errors
    if (err.code === 'ERR_NOT_FOUND') {
        return sendError(
            res,
            err.message || 'Resource not found',
            'ERR_NOT_FOUND',
            undefined,
            404
        );
    }

    // Default Internal Server Error
    return sendError(
        res,
        process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message || 'Internal server error',
        'ERR_INTERNAL_SERVER',
        undefined,
        err.status || 500
    );
};
