import rateLimit from 'express-rate-limit';

/**
 * Rate limiting for public endpoints to prevent abuse
 */
export const publicActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
        code: 'ERR_TOO_MANY_REQUESTS'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 login attempts per hour
    message: {
        success: false,
        error: 'Too many login attempts, please try again in an hour.',
        code: 'ERR_TOO_MANY_REQUESTS'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
