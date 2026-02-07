'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import styles from './wishlist.module.css';

interface WishlistItem {
    id: number;
    product: {
        id: number;
        title: string;
        price: number;
        salePrice?: number;
        isOnSale: boolean;
        imageUrl?: string;
        category: {
            name: string;
        };
    };
}

export default function WishlistPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const response = await fetch('/api/wishlist');
            if (response.ok) {
                const data = await response.json();
                setWishlistItems(data.wishlistItems);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoadingItems(false);
        }
    };

    const removeFromWishlist = async (productId: number) => {
        try {
            await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
            setWishlistItems(wishlistItems.filter(item => item.product.id !== productId));
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    if (loading || !user) {
        return (
            <div className="container" style={{ padding: '60px 20px' }}>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <h1 className={styles.title}>Ma Wishlist</h1>

            {loadingItems ? (
                <p>Chargement de votre wishlist...</p>
            ) : wishlistItems.length === 0 ? (
                <div className={styles.empty}>
                    <p>Votre wishlist est vide</p>
                    <Link href="/shop" className="btn btn-primary">
                        Découvrir nos produits
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {wishlistItems.map((item) => {
                        const displayPrice = item.product.isOnSale && item.product.salePrice
                            ? item.product.salePrice
                            : item.product.price;
                        const hasDiscount = item.product.isOnSale && item.product.salePrice;

                        return (
                            <div key={item.id} className={styles.card}>
                                <Link href={`/product/${item.product.id}`} className={styles.imageWrapper}>
                                    {item.product.imageUrl ? (
                                        <img src={item.product.imageUrl} alt={item.product.title} className={styles.image} />
                                    ) : (
                                        <div className={styles.placeholder} />
                                    )}
                                    {hasDiscount && (
                                        <span className={styles.saleBadge}>
                                            -{Math.round(((item.product.price - item.product.salePrice!) / item.product.price) * 100)}%
                                        </span>
                                    )}
                                </Link>
                                <div className={styles.details}>
                                    <span className={styles.category}>{item.product.category.name}</span>
                                    <Link href={`/product/${item.product.id}`}>
                                        <h3 className={styles.productTitle}>{item.product.title}</h3>
                                    </Link>
                                    <div className={styles.priceSection}>
                                        <p className={styles.price}>{displayPrice.toFixed(2)} DT</p>
                                        {hasDiscount && (
                                            <p className={styles.originalPrice}>{item.product.price.toFixed(2)} DT</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeFromWishlist(item.product.id)}
                                        className={styles.removeBtn}
                                    >
                                        <Trash2 size={18} />
                                        Retirer
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
