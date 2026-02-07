'use client';

import Link from 'next/link';
import styles from './ProductCard.module.css';
import { motion } from 'framer-motion';
import { Product } from '@prisma/client';
import { useI18n } from './I18nContext';

export default function ProductCard({ product }: { product: Product & { category: { name: string } } }) {
    const { t } = useI18n();

    return (
        <motion.div
            className={styles.card}
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.imageWrapper}>
                <Link href={`/product/${product.id}`}>
                    {product.imageUrl ? (
                        <motion.img
                            src={product.imageUrl}
                            alt={product.title}
                            className={styles.image}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                        />
                    ) : (
                        <div className={styles.placeholder} />
                    )}
                </Link>
                <div className={styles.overlay}>
                    <motion.button
                        className={styles.addToCartBtn}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {t('shop.add_to_cart')}
                    </motion.button>
                </div>
            </div>
            <div className={styles.info}>
                <span className={styles.category}>{product.category.name}</span>
                <h3 className={styles.title}>
                    <Link href={`/product/${product.id}`}>{product.title}</Link>
                </h3>
                <p className={styles.price}>{product.price.toFixed(2)} DT</p>
            </div>
        </motion.div>
    );
}
