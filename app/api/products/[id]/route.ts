import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Error fetching product' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await request.json();

        // Extract fields to ensure type safety
        const {
            title, description, price, salePrice, isOnSale,
            sku, brand, stock, categoryId, imageUrl,
            sizes, colors, tags
        } = body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                title,
                description,
                price: parseFloat(price),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                isOnSale,
                sku,
                brand,
                stock: stock ? parseInt(stock) : null,
                categoryId: parseInt(categoryId),
                imageUrl,
                sizes: sizes ? sizes : null,
                colors: colors ? colors : null,
                tags: tags ? tags : null,
            },
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Error updating product', details: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        // Check for associated orders
        const orderCount = await prisma.orderItem.count({
            where: { productId: id }
        });

        if (orderCount > 0) {
            return NextResponse.json({
                error: 'Cannot delete product',
                details: `Ce produit est lié à ${orderCount} commande(s). Impossible de le supprimer.`
            }, { status: 400 });
        }

        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Error deleting product', details: error.message }, { status: 500 });
    }
}
