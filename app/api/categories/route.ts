import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const hierarchy = searchParams.get('hierarchy');

        // If hierarchy=true, fetch nested children (up to 3 levels)
        if (hierarchy === 'true') {
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
            return NextResponse.json(categories);
        }

        // Default: flat list
        const categories = await prisma.category.findMany({
            include: { parent: true }
        });
        return NextResponse.json(categories);
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({
            error: 'Error fetching categories',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, imageUrl, parentId } = body;

        const category = await prisma.category.create({
            data: {
                name,
                description,
                imageUrl,
                parentId: parentId || null
            },
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Error creating category:', error);
        return NextResponse.json({
            error: 'Error creating category',
            details: error.message
        }, { status: 500 });
    }
}
