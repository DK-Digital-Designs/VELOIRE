"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const rateLimit_1 = require("../middleware/rateLimit");
const mailService_1 = require("../services/mailService");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const rfaSchema = zod_1.z.object({
    clientName: zod_1.z.string().min(2),
    clientEmail: zod_1.z.string().email(),
    phone: zod_1.z.string().min(10),
    vehicleId: zod_1.z.string().uuid().optional().nullable(),
    startDate: zod_1.z.coerce.date().optional().nullable(),
    endDate: zod_1.z.coerce.date().optional().nullable(),
    usageDescription: zod_1.z.string().optional().nullable(),
}).refine(data => {
    if (data.startDate && data.endDate) {
        const diff = data.endDate.getTime() - data.startDate.getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        return days <= 7 && days > 0;
    }
    return true;
}, {
    message: "Maximum rental duration is 7 days, and end date must be after start date.",
    path: ["endDate"]
});
const ownerApplySchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(10),
    storageDescription: zod_1.z.string().optional().nullable(),
});
// POST /api/v1/requests - Submit Request for Access (RFA)
router.post('/requests', rateLimit_1.publicActionLimiter, async (req, res, next) => {
    try {
        const data = rfaSchema.parse(req.body);
        const rfa = await prisma.requestForAccess.create({
            data: {
                ...data,
                status: 'PENDING'
            },
            include: {
                vehicle: true
            }
        });
        // Send confirmation email
        await (0, mailService_1.sendMail)(data.clientEmail, 'Your VELOIRE Request Received', (0, mailService_1.getTemplate)('rfa-submitted', {
            clientName: data.clientName,
            vehicleName: rfa.vehicle?.name || 'General Access',
            startDate: data.startDate?.toLocaleDateString() || 'TBD',
            endDate: data.endDate?.toLocaleDateString() || 'TBD',
        }));
        return (0, response_1.sendSuccess)(res, { rfa }, undefined, 201);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/v1/owners/apply - Submit Owner Enquiry
router.post('/owners/apply', rateLimit_1.publicActionLimiter, async (req, res, next) => {
    try {
        const data = ownerApplySchema.parse(req.body);
        const owner = await prisma.owner.create({
            data: {
                ...data,
                status: 'PENDING'
            }
        });
        // Send confirmation email
        await (0, mailService_1.sendMail)(data.email, 'Your VELOIRE Partnership Enquiry', (0, mailService_1.getTemplate)('owner-applied', {
            name: data.name
        }));
        return (0, response_1.sendSuccess)(res, { owner }, undefined, 201);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/v1/fleet - Public fleet listing
router.get('/fleet', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [vehicles, total] = await Promise.all([
            prisma.vehicle.findMany({
                where: { status: 'LIVE', deletedAt: null },
                include: { images: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.vehicle.count({ where: { status: 'LIVE', deletedAt: null } })
        ]);
        return (0, response_1.sendSuccess)(res, vehicles, { page, limit, total });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/v1/fleet/:slug - Get single vehicle details
router.get('/fleet/:slug', async (req, res, next) => {
    try {
        const vehicle = await prisma.vehicle.findFirst({
            where: {
                OR: [
                    { id: req.params.slug },
                    { slug: req.params.slug },
                    { name: { contains: req.params.slug } }
                ],
                status: 'LIVE',
                deletedAt: null
            },
            include: { images: true }
        });
        if (!vehicle) {
            return (0, response_1.sendError)(res, 'Vehicle not found', 'ERR_NOT_FOUND', null, 404);
        }
        return (0, response_1.sendSuccess)(res, vehicle);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
