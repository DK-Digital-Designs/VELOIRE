import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { sendError } from '../utils/response';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        return sendError(res, 'Authentication required', 'ERR_AUTH_UNAUTHORIZED', undefined, 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
        return sendError(res, 'Invalid or expired token', 'ERR_AUTH_UNAUTHORIZED', undefined, 401);
    }

    req.user = payload;
    next();
};

export const ensureAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return sendError(res, 'Admin access required', 'ERR_AUTH_FORBIDDEN', undefined, 403);
    }
    next();
};

export const ensureRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendError(res, 'Insufficient permissions', 'ERR_AUTH_FORBIDDEN', undefined, 403);
        }
        next();
    };
};
