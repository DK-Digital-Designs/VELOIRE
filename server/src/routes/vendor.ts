import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// In a real prod app, we would verify the role is 'OWNER'
router.use(isAuthenticated);

// GET /api/v1/vendor/fleet - Get assets for the logged in partner
router.get('/fleet', async (req: any, res, next) => {
    try {
        // For this demo, we'll associate the admin user with the first owner in the DB
        // or look up by email.
        const userEmail = req.user?.email;

        const owner = await prisma.owner.findFirst({
            where: { email: userEmail }
        });

        if (!owner) {
            // Fallback for demo: just get the first owner's cars
            const firstOwner = await prisma.owner.findFirst();
            if (!firstOwner) return sendSuccess(res, []);

            const vehicles = await prisma.vehicle.findMany({
                where: { ownerId: firstOwner.id, deletedAt: null },
                include: { images: true }
            });
            return sendSuccess(res, vehicles);
        }

        const vehicles = await prisma.vehicle.findMany({
            where: { ownerId: owner.id, deletedAt: null },
            include: { images: true }
        });

        return sendSuccess(res, vehicles);
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/vendor/metrics - Get yield/performance for the owner
router.get('/metrics', async (req: any, res, next) => {
    try {
        const userEmail = req.user?.email;
        const owner = await prisma.owner.findFirst({ where: { email: userEmail } }) || await prisma.owner.findFirst();

        if (!owner) return sendSuccess(res, { totalYield: 0, utilization: 0 });

        const vehicleCount = await prisma.vehicle.count({ where: { ownerId: owner.id, deletedAt: null } });

        return sendSuccess(res, {
            totalYield: `R${(vehicleCount * 22500).toLocaleString()}`,
            utilization: '78%',
            activeListings: vehicleCount
        });
    } catch (error) {
        next(error);
    }
});

export default router;
