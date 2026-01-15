import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response';
import { publicActionLimiter } from '../middleware/rateLimit';
import { sendMail, getTemplate } from '../services/mailService';

const router = Router();
const prisma = new PrismaClient();

const rfaSchema = z.object({
    clientName: z.string().min(2),
    clientEmail: z.string().email(),
    phone: z.string().min(10),
    vehicleId: z.string().uuid().optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    usageDescription: z.string().optional().nullable(),
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

const ownerApplySchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    storageDescription: z.string().optional().nullable(),
});

// POST /api/v1/requests - Submit Request for Access (RFA)
router.post('/requests', publicActionLimiter, async (req, res, next) => {
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
        await sendMail(
            data.clientEmail,
            'Your VELOIRE Request Received',
            getTemplate('rfa-submitted', {
                clientName: data.clientName,
                vehicleName: rfa.vehicle?.name || 'General Access',
                startDate: data.startDate?.toLocaleDateString() || 'TBD',
                endDate: data.endDate?.toLocaleDateString() || 'TBD',
            })
        );

        return sendSuccess(res, { rfa }, undefined, 201);
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/owners/apply - Submit Owner Enquiry
router.post('/owners/apply', publicActionLimiter, async (req, res, next) => {
    try {
        const data = ownerApplySchema.parse(req.body);

        const owner = await prisma.owner.create({
            data: {
                ...data,
                status: 'PENDING'
            }
        });

        // Send confirmation email
        await sendMail(
            data.email,
            'Your VELOIRE Partnership Enquiry',
            getTemplate('owner-applied', {
                name: data.name
            })
        );

        return sendSuccess(res, { owner }, undefined, 201);
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/fleet - Public fleet listing
router.get('/fleet', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
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

        return sendSuccess(res, vehicles, { page, limit, total });
    } catch (error) {
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
            return sendError(res, 'Vehicle not found', 'ERR_NOT_FOUND', null, 404);
        }

        return sendSuccess(res, vehicle);
    } catch (error) {
        next(error);
    }
});

export default router;
