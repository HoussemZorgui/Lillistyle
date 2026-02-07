'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useI18n } from '@/components/I18nContext';
import styles from './account.module.css';

interface Order {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: any[];
}

export default function AccountPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const { t } = useI18n();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (loading || !user) {
        return (
            <div className={styles.container}>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Mon Compte</h1>
                <button onClick={handleLogout} className="btn btn-secondary">
                    Déconnexion
                </button>
            </div>

            <div className={styles.grid}>
                {/* User Info Card */}
                <div className={styles.card}>
                    <h2>Informations Personnelles</h2>
                    <div className={styles.info}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Nom:</span>
                            <span>{user.firstName} {user.lastName || ''}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email:</span>
                            <span>{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Téléphone:</span>
                                <span>{user.phone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Orders Card */}
                <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                    <h2>Mes Commandes</h2>
                    {loadingOrders ? (
                        <p>Chargement des commandes...</p>
                    ) : orders.length === 0 ? (
                        <p className={styles.empty}>Vous n'avez pas encore passé de commande.</p>
                    ) : (
                        <div className={styles.orders}>
                            {orders.map((order) => (
                                <div key={order.id} className={styles.order}>
                                    <div className={styles.orderHeader}>
                                        <div>
                                            <strong>Commande #{order.orderNumber}</strong>
                                            <span className={styles.orderDate}>
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`${styles.status} ${styles[order.status]}`}>
                                                {order.status}
                                            </span>
                                            <strong className={styles.total}>
                                                {order.totalAmount.toFixed(2)} DT
                                            </strong>
                                        </div>
                                    </div>
                                    <div className={styles.orderItems}>
                                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
