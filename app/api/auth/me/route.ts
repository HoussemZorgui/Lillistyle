import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                createdAt: true,
                shippingAddress: true,
            },
        });

        if (!userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user: userData });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to get user data' },
            { status: 500 }
        );
    }
}
