'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: number;
    title: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: { id: number; title: string; price: number; imageUrl: string | null }) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
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

    const addToCart = (product: { id: number; title: string; price: number; imageUrl: string | null }) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) => item.id === id ? { ...item, quantity } : item)
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
