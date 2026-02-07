require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function main() {
    console.log('Testing email...');
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('Error: SMTP credentials missing in .env file');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'Lillistyle <no-reply@lillistyle.tn>',
            to: 'houssemzorgui10@gmail.com',
            subject: 'Test Email Lillistyle',
            text: 'Ceci est un test pour vérifier la configuration SMTP.',
            html: '<h1>Test Email</h1><p>Ceci est un test pour vérifier la configuration SMTP de Lillistyle.</p>',
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

main();
