const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for Notification model...');
    if (prisma.notification) {
        console.log('Notification model exists on Prisma Client.');
        try {
            const count = await prisma.notification.count();
            console.log(`Current notification count: ${count}`);
        } catch (e) {
            console.error('Error querying notifications:', e);
        }
    } else {
        console.error('ERROR: Notification model is UNDEFINED on Prisma Client.');
        console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
