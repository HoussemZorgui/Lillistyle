'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: number;
    title: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
    selectedSize?: string;
    selectedColor?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: { id: number; title: string; price: number; imageUrl: string | null; selectedSize?: string; selectedColor?: string }) => void;
    removeFromCart: (id: number, size?: string, color?: string) => void;
    updateQuantity: (id: number, quantity: number, size?: string, color?: string) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('lillistyle_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('lillistyle_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: { id: number; title: string; price: number; imageUrl: string | null; selectedSize?: string; selectedColor?: string }) => {
        setCart((prev) => {
            const existing = prev.find((item) =>
                item.id === product.id &&
                item.selectedSize === product.selectedSize &&
                item.selectedColor === product.selectedColor
            );
            if (existing) {
                return prev.map((item) =>
                    (item.id === product.id &&
                        item.selectedSize === product.selectedSize &&
                        item.selectedColor === product.selectedColor)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number, size?: string, color?: string) => {
        setCart((prev) => prev.filter((item) =>
            !(item.id === id && item.selectedSize === size && item.selectedColor === color)
        ));
    };

    const updateQuantity = (id: number, quantity: number, size?: string, color?: string) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) =>
                (item.id === id && item.selectedSize === size && item.selectedColor === color)
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
