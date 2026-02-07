
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);

        const adminSession = request.cookies.get('admin_session');
        if (!adminSession || adminSession.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for active orders
        const activeOrdersCount = await prisma.order.count({
            where: {
                userId: id,
                status: {
                    in: ['pending', 'processing', 'shipped']
                }
            }
        });

        if (activeOrdersCount > 0) {
            return NextResponse.json({
                error: 'Cannot delete user',
                details: 'Ce client a des commandes en cours ou en livraison. Impossible de supprimer le compte.'
            }, { status: 400 });
        }

        // Delete user's completed/cancelled orders first (schema doesn't cascade)
        await prisma.order.deleteMany({
            where: { userId: id }
        });

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);

        const adminSession = request.cookies.get('admin_session');
        if (!adminSession || adminSession.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { role } = await request.json();

        if (!['USER', 'ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role }
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
