'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function CartButton() {
    const { cart } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <Link href="/cart" className={styles.cartBtn}>
            <ShoppingBag size={24} color="var(--text-main)" />
            {mounted && itemCount > 0 && (
                <span className={styles.badge}>{itemCount}</span>
            )}
        </Link>
    );
}
