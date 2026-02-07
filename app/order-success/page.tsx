'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { useI18n } from '@/components/I18nContext';

export default function OrderSuccessPage() {
    const { t } = useI18n();

    return (
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
            <AnimatedSection>
                <CheckCircle size={80} color="#10b981" style={{ marginBottom: '30px' }} />
                <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>
                    {t('checkout.order_success') || "Merci pour votre commande !"}
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px' }}>
                    {t('checkout.order_success_desc') || "Votre commande a été passée avec succès et est en cours de traitement. Nous vous avons envoyé un e-mail de confirmation."}
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <Link href="/shop" className="btn btn-primary">
                        {t('hero.shop_now')}
                    </Link>
                    <Link href="/" className="btn btn-outline">
                        {t('nav.home')}
                    </Link>
                </div>
            </AnimatedSection>
        </div>
    );
}
