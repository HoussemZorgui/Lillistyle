'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import styles from '../../account.module.css'; // Reusing account styles
import { toast } from 'react-hot-toast';

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    size?: string;
    product: {
        id: number;
        title: string;
        imageUrl: string;
    };
}

interface Order {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    shippingName: string;
    shippingStreet: string;
    shippingCity: string;
    shippingPostalCode: string;
    shippingCountry: string;
    paymentMethod: string;
    items: OrderItem[];
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, loading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user && id) {
            fetchOrder(id);
        }
    }, [user, id]);

    const fetchOrder = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
            } else {
                toast.error('Commande introuvable');
                router.push('/account');
            }
        } catch (error) {
            console.error('Failed to fetch order', error);
            toast.error('Erreur de chargement');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center' }}>
                <p>Chargement de la commande...</p>
            </div>
        );
    }

    if (!order) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f39c12';
            case 'processing': return '#3498db';
            case 'shipped': return '#9b59b6';
            case 'delivered': return '#27ae60';
            case 'cancelled': return '#c0392b';
            default: return '#7f8c8d';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'En Attente';
            case 'processing': return 'En Préparation';
            case 'shipped': return 'Expédiée';
            case 'delivered': return 'Livrée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
            <Link href="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', marginBottom: '20px' }}>
                <ArrowLeft size={18} /> Retour à mon compte
            </Link>

            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>Commande #{order.orderNumber}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#666', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '30px',
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Package size={18} />
                        {getStatusText(order.status)}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: '30px', borderBottom: '1px solid #eee' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} color="#ee5253" /> Adresse de livraison
                        </h3>
                        <div style={{ color: '#444', lineHeight: '1.6', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                            <strong>{order.shippingName}</strong><br />
                            {order.shippingStreet}<br />
                            {order.shippingPostalCode} {order.shippingCity}<br />
                            {order.shippingCountry}
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={18} color="#2e86de" /> Paiement
                        </h3>
                        <div style={{ color: '#444', lineHeight: '1.6', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Méthode:</span>
                                <strong>{order.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Carte Bancaire'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                                <span>Total:</span>
                                <span>{order.totalAmount.toFixed(2)} DT</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingBag size={18} color="#ff9f43" /> Articles commandés
                    </h3>
                    <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.85rem', color: '#666' }}>Produit</th>
                                    <th style={{ padding: '15px', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>Prix</th>
                                    <th style={{ padding: '15px', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>Qté</th>
                                    <th style={{ padding: '15px', textAlign: 'right', fontSize: '0.85rem', color: '#666' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item.id} style={{ borderTop: '1px solid #eee' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#f0f0f0' }}>
                                                    {item.product.imageUrl ? (
                                                        <img src={item.product.imageUrl} alt={item.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>Tag</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.product.title}</div>
                                                    {item.size && (
                                                        <div style={{ fontSize: '0.85rem', color: '#888', background: '#f0f0f0', display: 'inline-block', padding: '2px 6px', borderRadius: '4px' }}>
                                                            Taille: {item.size}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>{item.price.toFixed(2)} DT</td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>{(item.price * item.quantity).toFixed(2)} DT</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
