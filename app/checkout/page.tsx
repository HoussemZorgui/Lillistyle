'use client';

import { useCart } from '@/components/CartContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import AnimatedSection from '@/components/AnimatedSection';
import { useI18n } from '@/components/I18nContext';

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const { t } = useI18n();
    const router = useRouter();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'France'
    });

    useEffect(() => {
        if (cart.length === 0) {
            router.push('/shop');
        }
    }, [cart, router]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
            }));

            // Fetch saved address
            fetch('/api/auth/me')
                .then(res => res.json())
                .then(data => {
                    if (data.user?.shippingAddress) {
                        const addr = data.user.shippingAddress;
                        setFormData(prev => ({
                            ...prev,
                            fullName: addr.fullName || prev.fullName,
                            address: addr.street,
                            city: addr.city,
                            postalCode: addr.postalCode,
                            country: addr.country
                        }));
                    }
                })
                .catch(err => console.error('Failed to fetch address:', err));
        }
    }, [user]);

    if (cart.length === 0) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    shippingAddress: formData,
                    paymentMethod: 'card' // Simplified for now
                }),
            });

            if (response.ok) {
                clearCart();
                router.push('/order-success');
            } else {
                alert('Une erreur est survenue lors de la commande.');
            }
        } catch (error) {
            console.error('Order error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <AnimatedSection>
                <h1 className={styles.title}>{t('checkout.title')}</h1>
                <form onSubmit={handleSubmit} className={styles.layout}>
                    <div className={styles.shippingInfo}>
                        <div className={styles.card}>
                            <h3>{t('checkout.shipping')}</h3>
                            <div className={styles.grid}>
                                <div className={styles.field}>
                                    <label>Nom Complet</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe" />
                                </div>
                                <div className={styles.field}>
                                    <label>Adresse E-mail</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                                </div>
                                <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                                    <label>Adresse</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="123 Rue de la Paix" />
                                </div>
                                <div className={styles.field}>
                                    <label>Ville</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Paris" />
                                </div>
                                <div className={styles.field}>
                                    <label>Code Postal</label>
                                    <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required placeholder="75001" />
                                </div>
                            </div>
                        </div>

                        <div className={styles.card} style={{ marginTop: '30px' }}>
                            <h3>{t('checkout.payment')}</h3>
                            <div className={styles.paymentOptions}>
                                <label className={styles.radioLabel}>
                                    <input type="radio" name="payment" defaultChecked />
                                    <span>Carte Bancaire</span>
                                </label>
                                <label className={styles.radioLabel}>
                                    <input type="radio" name="payment" />
                                    <span>PayPal</span>
                                </label>
                                <label className={styles.radioLabel}>
                                    <input type="radio" name="payment" />
                                    <span>Paiement à la livraison</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.summary}>
                        <div className={styles.summaryCard}>
                            <h3>{t('checkout.order_summary')}</h3>
                            <div className={styles.orderItems}>
                                {cart.map((item: any) => (
                                    <div key={item.id} className={styles.orderItem}>
                                        <span>{item.title} x {item.quantity}</span>
                                        <span>{(item.price * item.quantity).toFixed(2)} DT</span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.divider}></div>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>{cartTotal.toFixed(2)} DT</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping</span>
                                <span>Gratuit</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total</span>
                                <span>{cartTotal.toFixed(2)} DT</span>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '30px' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Traitement...' : t('checkout.place_order')}
                            </button>
                        </div>
                    </div>
                </form>
            </AnimatedSection>
        </div>
    );
}
