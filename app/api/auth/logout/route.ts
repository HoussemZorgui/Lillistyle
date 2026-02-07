import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await clearAuthCookie();

        return NextResponse.json({
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
        );
    }
}
