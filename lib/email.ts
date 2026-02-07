import nodemailer from 'nodemailer';

// Configure the transporter with SMTP credentials
// For Gmail: Use 'gmail' as service with App Password
// For custom domain: Use standard SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // Your email address
        pass: process.env.SMTP_PASS, // Your App Password
    },
});

export const sendOrderEmail = async (order: any, status: string) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP credentials missing. Email not sent.');
        return;
    }

    const subjectMap: Record<string, string> = {
        'pending': '⏳ Confirmation de votre commande Lillistyle',
        'processing': '✅ Votre commande Lillistyle est confirmée !',
        'shipped': '🚚 Votre commande Lillistyle est en route !',
        'delivered': '📦 Votre commande Lillistyle a été livrée',
        'cancelled': '❌ Annulation de votre commande Lillistyle',
    };

    const statusMessageMap: Record<string, string> = {
        'pending': 'Nous avons bien reçu votre commande et elle est en attente de validation.',
        'processing': 'Excellente nouvelle ! Votre commande a été validée et est en cours de préparation.',
        'shipped': 'Votre commande a quitté notre entrepôt et est en route vers chez vous.',
        'delivered': 'Votre commande a été livrée. Nous espérons que vos articles vous plairont !',
        'cancelled': 'Votre commande a été annulée. Si vous avez des questions, n\'hésitez pas à nous contacter.',
    };

    const statusTitleMap: Record<string, string> = {
        'pending': 'Commande Reçue',
        'processing': 'Commande Confirmée',
        'shipped': 'Commande Expédiée',
        'delivered': 'Commande Livrée',
        'cancelled': 'Commande Annulée',
    };

    const statusColorMap: Record<string, string> = {
        'pending': '#f39c12',
        'processing': '#3498db',
        'shipped': '#9b59b6',
        'delivered': '#27ae60',
        'cancelled': '#c0392b',
    };

    const subject = subjectMap[status] || `Mise à jour de votre commande #${order.orderNumber}`;
    const message = statusMessageMap[status] || `Le statut de votre commande est maintenant : ${status}`;
    const title = statusTitleMap[status] || 'Mise à jour Commande';
    const color = statusColorMap[status] || '#333';

    // Generate HTML for order items
    const itemsHtml = order.items.map((item: any) => `
        <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
            <img src="${item.product?.imageUrl || 'https://via.placeholder.com/50'}" alt="${item.product?.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: bold; color: #333;">${item.product?.title}</p>
                <p style="margin: 5px 0 0; font-size: 0.85rem; color: #666;">
                    Qté: ${item.quantity} | Taille: ${item.size || 'N/A'}
                </p>
            </div>
            <div style="font-weight: bold; color: #333;">{(item.price * item.quantity).toFixed(2)} DT</div>
        </div>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
            .logo { height: 40px; margin-bottom: 10px; }
            .status-banner { background-color: ${color}; color: white; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .items-list { margin: 20px 0; }
            .footer { text-align: center; font-size: 0.8rem; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Lillistyle</h1>
            </div>

            <div class="status-banner">
                <h2 style="margin: 0; font-size: 20px;">${title}</h2>
            </div>
            
            <p>Bonjour <strong>${order.shippingName || order.user?.firstName || 'Client'}</strong>,</p>
            
            <p>${message}</p>
            
            <div class="order-details">
                <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Détails de la commande #${order.orderNumber}</h3>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                <div class="items-list">
                    ${itemsHtml}
                </div>
                <div style="text-align: right; margin-top: 15px; font-size: 1.2rem; font-weight: bold;">
                    Total: ${parseFloat(order.totalAmount).toFixed(2)} DT
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders/${order.id}" class="btn">Suivre ma commande</a>
            </div>
            
            <div class="footer">
                <p>Merci de votre confiance !</p>
                <p>&copy; ${new Date().getFullYear()} Lillistyle. Tous droits réservés.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Lillistyle" <${process.env.SMTP_USER}>`,
            to: order.customerEmail || order.user?.email, // Send to customer email
            subject: subject,
            html: html,
        });
        console.log(`Email sent to ${order.customerEmail || order.user?.email} for status ${status}`);
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to prevent blocking the API response, just log it
    }
};
