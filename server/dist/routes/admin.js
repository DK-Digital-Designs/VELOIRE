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
// POST /api/v1/admin/fleet - Create new vehicle
router.post('/fleet', async (req, res, next) => {
    try {
        const { name, make, model, summary, heroImageUrl, specsJson, slug, year } = req.body;
        // Default owner for admin-created cars if no owner provided
        const defaultOwner = await prisma.owner.findFirst();
        if (!defaultOwner)
            return (0, response_1.sendError)(res, 'No owner found to assign vehicle', 'ERR_DEP_MISSING', undefined, 400);
        const vehicle = await prisma.vehicle.create({
            data: {
                name,
                make,
                model,
                year: parseInt(year) || new Date().getFullYear(),
                slug,
                summary,
                heroImageUrl,
                specsJson,
                status: 'LIVE',
                ownerId: defaultOwner.id
            }
        });
        // Also create a primary image record
        await prisma.vehicleImage.create({
            data: {
                vehicleId: vehicle.id,
                url: heroImageUrl,
                isPrimary: true,
                altText: name
            }
        });
        return (0, response_1.sendSuccess)(res, vehicle, 'Vehicle registered successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/v1/admin/fleet/:id - Delete vehicle
router.delete('/fleet/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        // Use soft delete (setting deletedAt) as per project pattern
        await prisma.vehicle.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'DISCONTINUED' }
        });
        return (0, response_1.sendSuccess)(res, { message: 'Vehicle decommissioned' });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/v1/admin/fleet/:id - Update vehicle
router.patch('/fleet/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        // Ensure year is a number if provided
        if (data.year)
            data.year = parseInt(data.year);
        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                ...data
            }
        });
        return (0, response_1.sendSuccess)(res, vehicle, 'Vehicle updated successfully');
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
