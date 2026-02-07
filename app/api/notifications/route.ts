
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: Fetch all notifications for the current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ notifications: [] }, { status: 401 });
        }

        // Fetch notifications, newest first
        const notifications = await prisma.notification.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to recent 20
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: user.userId,
                isRead: false
            }
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PATCH: Mark one or all notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, markAllRead } = body;

        if (markAllRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: user.userId,
                    isRead: false
                },
                data: { isRead: true }
            });
        } else if (id) {
            await prisma.notification.update({
                where: { id: parseInt(id) },
                data: { isRead: true }
            });
        } else {
            return NextResponse.json({ error: 'Missing id or markAllRead' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update notification error:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
