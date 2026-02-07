'use client';

import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import styles from './page.module.css';
import AnimatedSection from '@/components/AnimatedSection';
import { useI18n } from '@/components/I18nContext';
import { useEffect, useState, use } from 'react';

export default function ShopPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { t } = useI18n();
    const params = use(searchParams);
    const categoryFilter = params.category;

    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchCategories = fetch('/api/categories').then(res => res.json());
        const fetchProducts = fetch(`/api/products${categoryFilter ? `?category=${categoryFilter}` : ''}`).then(res => res.json());

        Promise.all([fetchCategories, fetchProducts]).then(([cats, prods]) => {
            setCategories(cats);
            setProducts(prods);
            setLoading(false);
        });
    }, [categoryFilter]);

    return (
        <div className="container" style={{ padding: '0 20px' }}>
            <header className={styles.header}>
                <img src="/uploads/coverture-image.png" alt="Shop Banner" className={styles.bannerImage} />
                <div className={styles.headerOverlay}>
                </div>
            </header>

            <div className={styles.layout}>
                <aside className={styles.filters}>
                    <div className={styles.filterHeader}>
                        <h3>{t('shop.categories') || "Catégories"}</h3>
                    </div>
                    <ul>
                        <li>
                            <Link
                                href="/shop"
                                className={`${styles.filterLink} ${!categoryFilter ? styles.activeFilter : ''}`}
                            >
                                {t('shop.all_products')}
                            </Link>
                        </li>
                        {categories.map((cat: any) => (
                            <li key={cat.id}>
                                <Link
                                    href={`/shop?category=${cat.name}`}
                                    className={`${styles.filterLink} ${categoryFilter === cat.name ? styles.activeFilter : ''}`}
                                >
                                    {cat.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className={styles.grid}>
                    {loading ? (
                        <p style={{ opacity: 0.5 }}>Chargement...</p>
                    ) : products.length === 0 ? (
                        <p>{t('shop.no_products')}</p>
                    ) : (
                        products.map((product: any, index: number) => (
                            <AnimatedSection key={product.id} delay={index * 0.1}>
                                <ProductCard product={product} />
                            </AnimatedSection>
                        ))
                    )}
                </main>
            </div>
        </div>
    );
}
