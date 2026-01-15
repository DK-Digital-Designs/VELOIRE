"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_1 = require("../utils/auth");
const response_1 = require("../utils/response");
const auth_2 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient(); // In production, use a singleton
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
// POST /api/v1/auth/login
router.post('/login', rateLimit_1.authLimiter, async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
        if (!user || !(await (0, auth_1.comparePassword)(password, user.passwordHash))) {
            return (0, response_1.sendError)(res, 'Invalid credentials', 'ERR_AUTH_INVALID', undefined, 401);
        }
        const token = (0, auth_1.generateToken)({ userId: user.id, role: user.role });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000, // 2 hours
        });
        return (0, response_1.sendSuccess)(res, {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    return (0, response_1.sendSuccess)(res, { message: 'Logged out successfully' });
});
// GET /api/v1/auth/me
router.get('/me', auth_2.isAuthenticated, async (req, res, next) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Unauthorized', 'ERR_AUTH_UNAUTHORIZED', undefined, 401);
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            return (0, response_1.sendError)(res, 'User not found', 'ERR_NOT_FOUND', undefined, 404);
        }
        return (0, response_1.sendSuccess)(res, { user });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
