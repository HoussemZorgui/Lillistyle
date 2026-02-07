'use client';

import { useCart } from '@/components/CartContext';
import { useState } from 'react';
import { useI18n } from '@/components/I18nContext';

interface AddToCartButtonProps {
    product: any;
    selectedSize?: string;
    selectedColor?: string;
}

export default function AddToCartButton({ product, selectedSize, selectedColor }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const { t } = useI18n();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addToCart({
            id: product.id,
            title: product.title,
            price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
            imageUrl: product.imageUrl,
            selectedSize,
            selectedColor,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleAdd}
            className={`btn btn-primary ${added ? 'added' : ''}`}
            style={{ width: '100%', maxWidth: '300px' }}
        >
            {added ? (t('shop.added') || 'Ajouté !') : t('shop.add_to_cart')}
        </button>
    );
}
