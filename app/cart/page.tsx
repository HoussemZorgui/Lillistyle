'use client';

import { useCart } from '@/components/CartContext';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import styles from './page.module.css';
import AnimatedSection from '@/components/AnimatedSection';
import { useI18n } from '@/components/I18nContext';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
    const { t } = useI18n();

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <AnimatedSection>
                    <ShoppingBag size={64} style={{ marginBottom: '20px', opacity: 0.3 }} />
                    <h1 className={styles.title}>{t('cart.empty')}</h1>
                    <p className={styles.subtitle}>Looks like you haven't added anything yet.</p>
                    <Link href="/shop" className="btn btn-primary" style={{ marginTop: '30px' }}>
                        {t('hero.shop_now')}
                    </Link>
                </AnimatedSection>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <AnimatedSection>
                <h1 className={styles.title}>{t('cart.title')}</h1>
                <div className={styles.layout}>
                    <div className={styles.items}>
                        {cart.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} />
                                    ) : (
                                        <div className={styles.placeholder}></div>
                                    )}
                                </div>
                                <div className={styles.itemInfo}>
                                    <h3>{item.title}</h3>
                                    <p className={styles.itemPrice}>{item.price.toFixed(2)} DT</p>
                                </div>
                                <div className={styles.quantity}>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className={styles.qtyBtn}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className={styles.qtyValue}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className={styles.qtyBtn}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className={styles.itemTotal}>
                                    {(item.price * item.quantity).toFixed(2)} DT
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className={styles.removeBtn}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <div className={styles.summaryCard}>
                            <h3>{t('checkout.order_summary')}</h3>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>{cartTotal.toFixed(2)} DT</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping</span>
                                <span>{t('shop.free_shipping') || 'Gratuit'}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total</span>
                                <span>{cartTotal.toFixed(2)} DT</span>
                            </div>
                            <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', textAlign: 'center' }}>
                                {t('cart.checkout')}
                            </Link>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </div>
    );
}
