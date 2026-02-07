import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { name, description, imageUrl, parentId } = body;
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                description,
                imageUrl,
                parentId: parentId || null
            }
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Error updating category:', error);
        return NextResponse.json({
            error: 'Error updating category',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        // Check if category has children
        const childrenCount = await prisma.category.count({
            where: { parentId: id }
        });

        if (childrenCount > 0) {
            return NextResponse.json({
                error: 'Cannot delete category with subcategories',
                details: 'Please delete all subcategories first'
            }, { status: 400 });
        }

        // Check if category has products
        const productsCount = await prisma.product.count({
            where: { categoryId: id }
        });

        if (productsCount > 0) {
            return NextResponse.json({
                error: 'Cannot delete category with products',
                details: `This category has ${productsCount} product(s). Please reassign or delete them first.`
            }, { status: 400 });
        }

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting category:', error);
        return NextResponse.json({
            error: 'Error deleting category',
            details: error.message
        }, { status: 500 });
    }
}
