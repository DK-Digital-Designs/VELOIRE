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
        where: { email: 'partner@veloire.com' },
        update: {},
        create: {
            name: 'Veloire Private Collection',
            email: 'partner@veloire.com',
            phone: '+27 11 000 0000',
            storageDescription: 'Veloire HQ - Secret Location',
            status: 'APPROVED',
        },
    });

    // 3. Clear Existing Vehicles to avoid slug conflicts
    await prisma.vehicleImage.deleteMany({});
    await prisma.requestForAccess.deleteMany({});
    await prisma.vehicle.deleteMany({});

    // 4. Create Premium Vehicles
    const vehicles = [
        {
            name: 'Ferrari SF90 Stradale',
            slug: 'ferrari-sf90-stradale',
            make: 'Ferrari',
            model: 'SF90 Stradale',
            year: 2024,
            summary: 'The pinnacle of Italian hybrid performance.',
            status: 'LIVE',
            heroImageUrl: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=1200',
            specs: {
                engine: '4.0L V8 Plug-in Hybrid',
                power: '986 hp',
                torque: '800 Nm',
                acceleration: '0-100km/h: 2.5s',
                topSpeed: '340 km/h'
            }
        },
        {
            name: 'Porsche 911 GT3 RS (992)',
            slug: 'porsche-911-gt3-rs',
            make: 'Porsche',
            model: '911 GT3 RS',
            year: 2024,
            summary: 'A race car with number plates.',
            status: 'LIVE',
            heroImageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200',
            specs: {
                engine: '4.0L Flat-Six',
                power: '518 hp',
                torque: '465 Nm',
                acceleration: '0-100km/h: 3.2s',
                topSpeed: '296 km/h'
            }
        },
        {
            name: 'Lamborghini Revuelto',
            slug: 'lamborghini-revuelto',
            make: 'Lamborghini',
            model: 'Revuelto',
            year: 2024,
            summary: 'The V12 hybrid era begins.',
            status: 'LIVE',
            heroImageUrl: 'https://images.unsplash.com/photo-1566473065135-322055663731?auto=format&fit=crop&q=80&w=1200',
            specs: {
                engine: '6.5L V12 Hybrid',
                power: '1,001 hp',
                torque: '725 Nm',
                acceleration: '0-100km/h: 2.5s',
                topSpeed: '350 km/h'
            }
        },
        {
            name: 'Rolls-Royce Spectre',
            slug: 'rolls-royce-spectre',
            make: 'Rolls-Royce',
            model: 'Spectre',
            year: 2024,
            summary: 'Silence, perfected.',
            status: 'LIVE',
            heroImageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=1200',
            specs: {
                engine: 'Dual Electric Motors',
                power: '577 hp',
                torque: '900 Nm',
                acceleration: '0-100km/h: 4.4s',
                topSpeed: '250 km/h'
            }
        },
        {
            name: 'McLaren 750S Spider',
            slug: 'mclaren-750s-spider',
            make: 'McLaren',
            model: '750S Spider',
            year: 2024,
            summary: 'The benchmark for driver engagement.',
            status: 'LIVE',
            heroImageUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=1200',
            specs: {
                engine: '4.0L Twin-Turbo V8',
                power: '740 hp',
                torque: '800 Nm',
                acceleration: '0-100km/h: 2.8s',
                topSpeed: '332 km/h'
            }
        }
    ];

    for (const v of vehicles) {
        const vehicle = await prisma.vehicle.create({
            data: {
                name: v.name,
                slug: v.slug,
                make: v.make,
                model: v.model,
                year: v.year,
                summary: v.summary,
                status: v.status as any,
                heroImageUrl: v.heroImageUrl,
                ownerId: owner1.id,
                specsJson: JSON.stringify(v.specs),
            }
        });

        await prisma.vehicleImage.create({
            data: {
                vehicleId: vehicle.id,
                url: v.heroImageUrl,
                isPrimary: true,
                altText: v.name,
            }
        });
    }

    console.log('Premium seed data created successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
