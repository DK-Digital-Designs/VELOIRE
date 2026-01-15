import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('admin123', 10);

    // 1. Create Admin User
    await prisma.user.upsert({
        where: { email: 'admin@veloire.com' },
        update: {},
        create: {
            email: 'admin@veloire.com',
            passwordHash,
            role: 'ADMIN',
        },
    });

    // 2. Create Owners
    const owner1 = await prisma.owner.upsert({
        where: { email: 'partner@urbangarage.com' },
        update: {},
        create: {
            name: 'Urban Garage Storage',
            email: 'partner@urbangarage.com',
            phone: '+27 11 123 4567',
            storageDescription: 'Storage Facility A - High Security',
            status: 'APPROVED',
        },
    });

    // 3. Create Vehicles
    const g63 = await prisma.vehicle.upsert({
        where: { slug: 'mercedes-amg-gt-63-s' },
        update: {},
        create: {
            name: 'Mercedes-AMG GT 63 S',
            slug: 'mercedes-amg-gt-63-s',
            make: 'Mercedes-AMG',
            model: 'GT 63 S',
            year: 2023,
            summary: 'A masterpiece of performance and luxury.',
            status: 'LIVE',
            ownerId: owner1.id,
            heroImageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200',
            specsJson: JSON.stringify({
                engine: '4.0L V8 Biturbo',
                power: '630 hp',
                torque: '900 Nm',
                topSpeed: '315 km/h',
            }),
        },
    });

    await prisma.vehicleImage.create({
        data: {
            vehicleId: g63.id,
            url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200',
            isPrimary: true,
            altText: 'Mercedes-AMG GT 63 S Front View',
        }
    });

    const m4 = await prisma.vehicle.upsert({
        where: { slug: 'bmw-m4-competition' },
        update: {},
        create: {
            name: 'BMW M4 Competition xDrive',
            slug: 'bmw-m4-competition',
            make: 'BMW',
            model: 'M4 Competition',
            year: 2024,
            summary: 'The ultimate driving machine.',
            status: 'LIVE',
            ownerId: owner1.id,
            heroImageUrl: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1200',
            specsJson: JSON.stringify({
                engine: '3.0L Straight-Six',
                power: '503 hp',
                topSpeed: '290 km/h',
            }),
        },
    });

    await prisma.vehicleImage.create({
        data: {
            vehicleId: m4.id,
            url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1200',
            isPrimary: true,
            altText: 'BMW M4 Competition Front View',
        }
    });

    // 4. Create Sample Requests
    await prisma.requestForAccess.create({
        data: {
            clientName: 'Michael Stone',
            clientEmail: 'michael@example.com',
            phone: '+27 82 000 1111',
            vehicleId: g63.id,
            usageDescription: 'Weekend trip to the coast.',
            status: 'PENDING',
        },
    });

    console.log('Seed data created successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
