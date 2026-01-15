import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { comparePassword, generateToken } from '../utils/auth';
import { sendSuccess, sendError } from '../utils/response';
import { isAuthenticated, AuthenticatedRequest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();
const prisma = new PrismaClient(); // In production, use a singleton

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// POST /api/v1/auth/login
router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findFirst({
            where: { email, deletedAt: null },
        });

        if (!user || !(await comparePassword(password, user.passwordHash))) {
            return sendError(res, 'Invalid credentials', 'ERR_AUTH_INVALID', undefined, 401);
        }

        const token = generateToken({ userId: user.id, role: user.role });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000, // 2 hours
        });

        return sendSuccess(res, {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    return sendSuccess(res, { message: 'Logged out successfully' });
});

// GET /api/v1/auth/me
router.get('/me', isAuthenticated, async (req: AuthenticatedRequest, res, next) => {
    try {
        if (!req.user) return sendError(res, 'Unauthorized', 'ERR_AUTH_UNAUTHORIZED', undefined, 401);

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, role: true },
        });

        if (!user) {
            return sendError(res, 'User not found', 'ERR_NOT_FOUND', undefined, 404);
        }

        return sendSuccess(res, { user });
    } catch (error) {
        next(error);
    }
});

export default router;
