import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get reviews for a product
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const reviews = await prisma.review.findMany({
            where: { productId: parseInt(productId) },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            reviews,
            averageRating: avgRating,
            totalReviews: reviews.length,
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json(
            { error: 'Failed to get reviews' },
            { status: 500 }
        );
    }
}

// Submit a review
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
        const { productId, rating, title, comment } = body;

        if (!productId || !rating) {
            return NextResponse.json(
                { error: 'Product ID and rating are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
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

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                productId,
                userId: user.userId,
            },
        });

        if (existingReview) {
            return NextResponse.json(
                { error: 'You have already reviewed this product' },
                { status: 400 }
            );
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                productId,
                userId: user.userId,
                rating,
                title,
                comment,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Review submitted successfully',
            review,
        });
    } catch (error) {
        console.error('Submit review error:', error);
        return NextResponse.json(
            { error: 'Failed to submit review' },
            { status: 500 }
        );
    }
}
