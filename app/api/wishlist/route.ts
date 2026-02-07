import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get user's wishlist
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const wishlistItems = await prisma.wishlistItem.findMany({
            where: { userId: user.userId },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ wishlistItems });
    } catch (error) {
        console.error('Get wishlist error:', error);
        return NextResponse.json(
            { error: 'Failed to get wishlist' },
            { status: 500 }
        );
    }
}

// Add item to wishlist
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if already in wishlist
        const existing = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId: user.userId,
                    productId,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Product already in wishlist' },
                { status: 400 }
            );
        }

        // Add to wishlist
        const wishlistItem = await prisma.wishlistItem.create({
            data: {
                userId: user.userId,
                productId,
            },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Added to wishlist',
            wishlistItem,
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        return NextResponse.json(
            { error: 'Failed to add to wishlist' },
            { status: 500 }
        );
    }
}

// Remove item from wishlist
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        await prisma.wishlistItem.delete({
            where: {
                userId_productId: {
                    userId: user.userId,
                    productId: parseInt(productId),
                },
            },
        });

        return NextResponse.json({
            message: 'Removed from wishlist',
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return NextResponse.json(
            { error: 'Failed to remove from wishlist' },
            { status: 500 }
        );
    }
}
