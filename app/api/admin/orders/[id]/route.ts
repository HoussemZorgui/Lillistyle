import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOrderEmail } from '@/lib/email';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        // Check for admin session
        const adminSession = request.cookies.get('admin_session');
        if (!adminSession || adminSession.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status },
            include: { user: true, items: { include: { product: true } } } // Include data for email
        });

        // Send email notification (fire and forget)
        sendOrderEmail(updatedOrder, status).catch(console.error);

        // Create notification for user
        const notificationMessages: Record<string, string> = {
            'pending': `Votre commande #${updatedOrder.orderNumber} est en attente.`,
            'processing': `Votre commande #${updatedOrder.orderNumber} est en cours de préparation.`,
            'shipped': `Votre commande #${updatedOrder.orderNumber} a été expédiée !`,
            'delivered': `Votre commande #${updatedOrder.orderNumber} a été livrée.`,
            'cancelled': `Votre commande #${updatedOrder.orderNumber} a été annulée.`
        };

        const notificationTitles: Record<string, string> = {
            'pending': 'Commande reçue',
            'processing': 'Commande confirmée',
            'shipped': 'Commande expédiée',
            'delivered': 'Commande livrée',
            'cancelled': 'Commande annulée'
        };

        await prisma.notification.create({
            data: {
                userId: updatedOrder.userId,
                title: notificationTitles[status] || 'Mise à jour commande',
                message: notificationMessages[status] || `Nouveau statut : ${status}`,
                type: 'order_status',
                link: `/account/orders/${updatedOrder.id}`
            }
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Update Order Error:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
