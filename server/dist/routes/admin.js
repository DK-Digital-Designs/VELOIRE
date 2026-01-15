"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// All routes here are protected
router.use(auth_1.isAuthenticated);
router.use(auth_1.ensureAdmin);
// GET /api/v1/admin/metrics - Dashboard overview
router.get('/metrics', async (req, res, next) => {
    try {
        const [pendingRequests, approvedClients, liveVehicles] = await Promise.all([
            prisma.requestForAccess.count({ where: { status: 'PENDING', deletedAt: null } }),
            prisma.clientProfile.count({ where: { status: 'APPROVED' } }),
            prisma.vehicle.count({ where: { status: 'LIVE', deletedAt: null } }),
        ]);
        return (0, response_1.sendSuccess)(res, {
            pendingRequests,
            approvedClients,
            liveVehicles,
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/v1/admin/requests - List RFAs (paginated)
router.get('/requests', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            prisma.requestForAccess.findMany({
                where: { deletedAt: null },
                include: { vehicle: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.requestForAccess.count({ where: { deletedAt: null } })
        ]);
        return (0, response_1.sendSuccess)(res, requests, { page, limit, total });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/v1/admin/requests/:id/approve - Approve RFA
router.post('/requests/:id/approve', async (req, res, next) => {
    try {
        const { id } = req.params;
        const rfa = await prisma.requestForAccess.findUnique({ where: { id } });
        if (!rfa)
            return (0, response_1.sendError)(res, 'Request not found', 'ERR_NOT_FOUND', undefined, 404);
        // Update RFA status
        await prisma.requestForAccess.update({
            where: { id },
            data: { status: 'APPROVED' }
        });
        // In a real app, logic to create/link ClientProfile would go here
        // For now, we just return success
        return (0, response_1.sendSuccess)(res, { message: 'Request approved successfully' });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/v1/admin/requests/:id/reject - Reject RFA
router.post('/requests/:id/reject', async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.requestForAccess.update({
            where: { id },
            data: { status: 'REJECTED' }
        });
        return (0, response_1.sendSuccess)(res, { message: 'Request rejected successfully' });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/v1/admin/fleet - Full fleet list
router.get('/fleet', async (req, res, next) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { deletedAt: null },
            include: { owner: true, images: true },
            orderBy: { createdAt: 'desc' }
        });
        return (0, response_1.sendSuccess)(res, vehicles);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/v1/admin/owners - List owners
router.get('/owners', async (req, res, next) => {
    try {
        const owners = await prisma.owner.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });
        return (0, response_1.sendSuccess)(res, owners);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/v1/admin/testimonials - List testimonials
router.get('/testimonials', async (req, res, next) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { deletedAt: null },
            include: { client: { select: { email: true } }, vehicle: true },
            orderBy: { createdAt: 'desc' }
        });
        return (0, response_1.sendSuccess)(res, testimonials);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
