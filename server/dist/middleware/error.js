"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error('[Error Handler]', err);
    // Handle Zod Validation Errors
    if (err instanceof zod_1.ZodError) {
        const details = err.errors.reduce((acc, curr) => {
            acc[curr.path.join('.')] = curr.message;
            return acc;
        }, {});
        return (0, response_1.sendError)(res, 'Validation failed', 'ERR_VALIDATION', details, 400);
    }
    // Handle Authentication Errors
    if (err.name === 'UnauthorizedError' || err.code === 'ERR_AUTH_UNAUTHORIZED') {
        return (0, response_1.sendError)(res, err.message || 'Unauthorized', 'ERR_AUTH_UNAUTHORIZED', undefined, 401);
    }
    // Handle Forbidden Errors
    if (err.code === 'ERR_AUTH_FORBIDDEN') {
        return (0, response_1.sendError)(res, err.message || 'Forbidden', 'ERR_AUTH_FORBIDDEN', undefined, 403);
    }
    // Handle Not Found Errors
    if (err.code === 'ERR_NOT_FOUND') {
        return (0, response_1.sendError)(res, err.message || 'Resource not found', 'ERR_NOT_FOUND', undefined, 404);
    }
    // Default Internal Server Error
    return (0, response_1.sendError)(res, process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message || 'Internal server error', 'ERR_INTERNAL_SERVER', undefined, err.status || 500);
};
exports.errorHandler = errorHandler;
