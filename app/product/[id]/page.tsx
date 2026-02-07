'use client';

import styles from './page.module.css';
import AddToCartButton from './AddToCartButton';
import { notFound } from 'next/navigation';
import { useI18n } from '@/components/I18nContext';
import { useAuth } from '@/components/AuthContext';
import { useEffect, useState, use } from 'react';
import { Heart } from 'lucide-react';
import ProductReviews from '@/components/ProductReviews';
import ProductCard from '@/components/ProductCard';
import StructuredData from '@/components/StructuredData';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { t } = useI18n();
    const { user } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [inWishlist, setInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch(`/api/products/${id}`).then(res => res.json()),
            fetch(`/api/products?limit=4`).then(res => res.json())
        ]).then(([productData, productsData]) => {
            setProduct(productData);
            // Filter out current product from related
            setRelatedProducts(productsData.filter((p: any) => p.id !== parseInt(id)).slice(0, 3));

            // Parse sizes and colors
            if (productData.sizes) {
                const sizes = JSON.parse(productData.sizes);
                if (sizes.length > 0) setSelectedSize(sizes[0]);
            }
            if (productData.colors) {
                const colors = JSON.parse(productData.colors);
                if (colors.length > 0) setSelectedColor(colors[0]);
            }

            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });

        // Check if in wishlist
        if (user) {
            fetch('/api/wishlist')
                .then(res => res.json())
                .then(data => {
                    const isInWishlist = data.wishlistItems?.some((item: any) => item.productId === parseInt(id));
                    setInWishlist(isInWishlist);
                });
        }
    }, [id, user]);

    const toggleWishlist = async () => {
        if (!user) {
            window.location.href = '/auth/login';
            return;
        }

        setWishlistLoading(true);
        try {
            if (inWishlist) {
                await fetch(`/api/wishlist?productId=${id}`, { method: 'DELETE' });
                setInWishlist(false);
            } else {
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: parseInt(id) }),
                });
                setInWishlist(true);
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        } finally {
            setWishlistLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '60px 20px' }}><p>Chargement...</p></div>;
    if (!product) notFound();

    const sizes = product.sizes ? JSON.parse(product.sizes) : [];
    const colors = product.colors ? JSON.parse(product.colors) : [];
    const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    const hasDiscount = product.isOnSale && product.salePrice;

    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.imageUrl,
        offers: {
            '@type': 'Offer',
            price: displayPrice,
            priceCurrency: 'TND',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
    };

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <StructuredData data={productSchema} />
            <div className={styles.grid}>
                <div className={styles.imageWrapper}>
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.title} className={styles.image} />
                    ) : (
                        <div className={styles.placeholder} />
                    )}
                    {hasDiscount && (
                        <span className={styles.saleBadge}>
                            -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                        </span>
                    )}
                </div>
                <div className={styles.details}>
                    <span className={styles.category}>{product.category?.name}</span>
                    <h1 className={styles.title}>{product.title}</h1>

                    <div className={styles.priceSection}>
                        <p className={styles.price}>{displayPrice?.toFixed(2)} DT</p>
                        {hasDiscount && (
                            <p className={styles.originalPrice}>{product.price?.toFixed(2)} DT</p>
                        )}
                    </div>

                    {product.brand && (
                        <p className={styles.brand}>Marque: <strong>{product.brand}</strong></p>
                    )}

                    <div className={styles.description}>
                        <p>{product.description}</p>
                    </div>

                    {/* Size Selector */}
                    {sizes.length > 0 && (
                        <div className={styles.selector}>
                            <label>Taille:</label>
                            <div className={styles.options}>
                                {sizes.map((size: string) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`${styles.option} ${selectedSize === size ? styles.selected : ''}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Selector */}
                    {colors.length > 0 && (
                        <div className={styles.selector}>
                            <label>Couleur:</label>
                            <div className={styles.options}>
                                {colors.map((color: string) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`${styles.option} ${selectedColor === color ? styles.selected : ''}`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.stock !== undefined && (
                        <p className={styles.stock}>
                            {product.stock > 0 ? (
                                <span className={styles.inStock}>✓ En stock ({product.stock} disponibles)</span>
                            ) : (
                                <span className={styles.outOfStock}>✗ Rupture de stock</span>
                            )}
                        </p>
                    )}

                    <div className={styles.actions}>
                        <AddToCartButton
                            product={product}
                            selectedSize={selectedSize}
                            selectedColor={selectedColor}
                        />
                        <button
                            onClick={toggleWishlist}
                            className={`${styles.wishlistBtn} ${inWishlist ? styles.inWishlist : ''}`}
                            disabled={wishlistLoading}
                            title={inWishlist ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
                        >
                            <Heart size={24} fill={inWishlist ? 'var(--primary)' : 'none'} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Reviews */}
            <ProductReviews productId={parseInt(id)} />

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className={styles.relatedSection}>
                    <h2>Produits Similaires</h2>
                    <div className={styles.relatedGrid}>
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
