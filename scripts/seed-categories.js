const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing categories...');
    // Note: This will fail if there are products linked to these categories
    // For a seed script, it's better to be careful or use upsert.

    const rootCategories = ['Homme', 'Femme', 'Enfant'];

    for (const rootName of rootCategories) {
        console.log(`Creating root category: ${rootName}`);
        const root = await prisma.category.upsert({
            where: { id: (await prisma.category.findFirst({ where: { name: rootName } }))?.id || -1 },
            update: { name: rootName },
            create: {
                name: rootName,
                imageUrl: `https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop` // Placeholder
            },
        });

        const level1 = [
            { name: 'Vêtements', sub: ['Sous-vêtements', 'Pantalons', 'Pulls'] },
            { name: 'Accessoires', sub: [] },
            { name: 'Chaussures', sub: [] }
        ];

        for (const l1 of level1) {
            console.log(`  Creating subcategory: ${l1.name} under ${rootName}`);
            const parent1 = await prisma.category.create({
                data: {
                    name: l1.name,
                    parentId: root.id,
                    imageUrl: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop`
                }
            });

            for (const l2 of l1.sub) {
                console.log(`    Creating sub-subcategory: ${l2} under ${l1.name}`);
                await prisma.category.create({
                    data: {
                        name: l2,
                        parentId: parent1.id,
                        imageUrl: `https://images.unsplash.com/photo-1523381235312-3a1647fa9921?q=80&w=800&auto=format&fit=crop`
                    }
                });
            }
        }
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
