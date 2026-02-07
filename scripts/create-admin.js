const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@lillistyle.tn';
const ADMIN_PASSWORD = 'ChangeThisPassword123!';
const ADMIN_NAME = 'Houssem Zorgui';

async function main() {
    console.log(`Creating admin user: ${ADMIN_EMAIL}...`);

    try {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        const user = await prisma.user.upsert({
            where: { email: ADMIN_EMAIL },
            update: {
                role: 'ADMIN',
                password: hashedPassword,
                firstName: ADMIN_NAME.split(' ')[0],
                lastName: ADMIN_NAME.split(' ').slice(1).join(' '),
            },
            create: {
                email: ADMIN_EMAIL,
                password: hashedPassword,
                firstName: ADMIN_NAME.split(' ')[0],
                lastName: ADMIN_NAME.split(' ').slice(1).join(' '),
                role: 'ADMIN',
            },
        });

        console.log('Admin user created/updated successfully:');
        console.log({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        console.log(`Password: ${ADMIN_PASSWORD}`);

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
