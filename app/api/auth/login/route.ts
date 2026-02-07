import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = await createToken({
            userId: user.id,
            email: user.email,
        });

        // Determine if user is admin
        const isAdmin = user.role === 'ADMIN';

        // Prepare response
        const response = NextResponse.json({
            message: 'Login successful',
            isAdmin: isAdmin,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role, // Added role to response
            },
        });

        // Set auth token cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // If admin, set admin session cookie for middleware
        if (isAdmin) {
            response.cookies.set('admin_session', 'true', {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // Match auth token duration
                httpOnly: false, // Accessible by middleware
            });
        }

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Failed to login' },
            { status: 500 }
        );
    }
}
