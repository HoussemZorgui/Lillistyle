const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma Query...');
    try {
        const categories = await prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    include: {
                        children: true
                    }
                }
            }
        });
        console.log('Success!', JSON.stringify(categories, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
