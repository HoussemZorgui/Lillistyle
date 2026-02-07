import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            title,
            description,
            price,
            imageUrl,
            categoryId,
            salePrice,
            isOnSale,
            sku,
            brand,
            sizes,
            colors,
            stock,
            tags
        } = body;

        // Validate required fields
        if (!title || !price || !categoryId) {
            return NextResponse.json(
                { error: 'Title, price, and categoryId are required' },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
            data: {
                title,
                description: description || '',
                price: parseFloat(price),
                imageUrl: imageUrl || null,
                categoryId: parseInt(categoryId),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                isOnSale: isOnSale === true || isOnSale === 'true',
                sku: sku || null,
                brand: brand || null,
                sizes: sizes ? JSON.stringify(sizes) : null,
                colors: colors ? JSON.stringify(colors) : null,
                stock: stock !== undefined ? parseInt(stock) : null,
                tags: tags ? JSON.stringify(tags) : null,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({
            error: 'Error creating product',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
