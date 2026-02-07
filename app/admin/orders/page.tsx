'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Eye, Check, Truck, XCircle, Clock, Package } from 'lucide-react';

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null); // For modal

    const fetchOrders = () => {
        setLoading(true);
        fetch('/api/admin/orders')
            .then(res => {
                if (!res.ok) throw new Error('Unauthorized or failed to fetch');
                return res.json();
            })
            .then(data => {
                setOrders(data.orders);
                setLoading(false);
            })
            .catch(err => {
                toast.error(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId: number, newStatus: string) => {
        const loadingToast = toast.loading('Mise à jour du statut...');
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success(`Commande #${orderId} mise à jour : ${newStatus}`, { id: loadingToast });
                // Optimistic update or refetch
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Erreur lors de la mise à jour', { id: loadingToast });
        }
    };

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        let color = '#7f8c8d';
        let bg = '#ecf0f1';
        let label = status;
        let icon = <Clock size={14} />;

        switch (s) {
            case 'pending':
                color = '#f39c12';
                bg = '#fef5e7';
                label = 'En Attente';
                break;
            case 'processing': // Approved
                color = '#3498db';
                bg = '#ebf5fb';
                label = 'Approuvée';
                icon = <Check size={14} />;
                break;
            case 'shipped': // En livraison
                color = '#9b59b6';
                bg = '#f4ecf7';
                label = 'En Livraison';
                icon = <Truck size={14} />;
                break;
            case 'delivered':
                color = '#27ae60';
                bg = '#e9f7ef';
                label = 'Livrée';
                icon = <Package size={14} />;
                break;
            case 'cancelled':
            case 'rejected':
                color = '#c0392b';
                bg = '#fdedec';
                label = 'Rejetée';
                icon = <XCircle size={14} />;
                break;
        }

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: color,
                backgroundColor: bg,
                textTransform: 'uppercase'
            }}>
                {icon}
                {label}
            </span>
        );
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Chargement des commandes...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Gestion des Commandes</h1>
                    <p style={{ color: '#666' }}>Suivez et gérez les commandes clients</p>
                </div>
                <Link href="/admin" className="btn" style={{ background: '#f8f9fa', border: '1px solid #ddd' }}>
                    Retour au Dashboard
                </Link>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                        <tr>
                            <th style={tableHeaderStyle}>ID</th>
                            <th style={tableHeaderStyle}>Client</th>
                            <th style={tableHeaderStyle}>Date</th>
                            <th style={tableHeaderStyle}>Total</th>
                            <th style={tableHeaderStyle}>Statut Actuel</th>
                            <th style={tableHeaderStyle}>Actions Rapides</th>
                            <th style={tableHeaderStyle}>Détails</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Aucune commande pour le moment.</td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                                    <td style={tableCellStyle}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>#{order.orderNumber || order.id}</span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ fontWeight: '500' }}>
                                            {order.shippingName || order.user?.firstName + ' ' + order.user?.lastName || 'Client sans nom'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{order.user?.email}</div>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                                            {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={{ fontWeight: 'bold' }}>{parseFloat(order.totalAmount).toFixed(2)} DT</span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                background: '#fff'
                                            }}
                                        >
                                            <option value="pending">En Attente</option>
                                            <option value="processing">Approuver</option>
                                            <option value="shipped">En Livraison</option>
                                            <option value="delivered">Livrée</option>
                                            <option value="cancelled">Rejeter/Annuler</option>
                                        </select>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #eee',
                                                background: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <Eye size={16} /> Voir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setSelectedOrder(null)}>
                    <div style={{
                        background: '#fff',
                        width: '90%',
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        borderRadius: '16px',
                        padding: '30px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Commande #{selectedOrder.orderNumber}</h2>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                    Passée le {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedOrder.createdAt).toLocaleTimeString('fr-FR')}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    📦 Livraison
                                </h3>
                                <p><strong>{selectedOrder.shippingName}</strong></p>
                                <p>{selectedOrder.shippingStreet}</p>
                                <p>{selectedOrder.shippingPostalCode} {selectedOrder.shippingCity}</p>
                                <p>{selectedOrder.shippingCountry}</p>
                                {selectedOrder.shippingPhone && <p style={{ marginTop: '10px', color: '#666' }}>📞 {selectedOrder.shippingPhone}</p>}
                            </div>
                            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    👤 Client
                                </h3>
                                <p><strong>{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</strong></p>
                                <p style={{ color: '#666' }}>{selectedOrder.user?.email}</p>
                                <div style={{ marginTop: '15px' }}>
                                    <h4 style={{ fontSize: '0.85rem', marginBottom: '5px', color: '#888' }}>STATUT:</h4>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Articles ({selectedOrder.items.length})</h3>
                        <div style={{ marginBottom: '30px' }}>
                            {selectedOrder.items.map((item: any) => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f5f5f5' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '8px', overflow: 'hidden' }}>
                                            {item.product?.imageUrl && <img src={item.product.imageUrl} alt={item.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600' }}>{item.product?.title}</p>
                                            <p style={{ fontSize: '0.85rem', color: '#666' }}>
                                                Taille: {item.size || 'N/A'} | Qté: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'bold' }}>
                                        {(item.price * item.quantity).toFixed(2)} DT
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '2px solid #eee' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: '#666', marginBottom: '5px' }}>Total Commande</p>
                                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary, #000)' }}>
                                    {parseFloat(selectedOrder.totalAmount).toFixed(2)} DT
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button className="btn"
                                style={{ background: '#3498db', color: '#fff', border: 'none' }}
                                onClick={() => updateStatus(selectedOrder.id, 'processing')}
                            >
                                Approuver
                            </button>
                            <button className="btn"
                                style={{ background: '#9b59b6', color: '#fff', border: 'none' }}
                                onClick={() => updateStatus(selectedOrder.id, 'shipped')}
                            >
                                Expédier
                            </button>
                            <button className="btn"
                                style={{ background: '#c0392b', color: '#fff', border: 'none' }}
                                onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                            >
                                Rejeter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const tableHeaderStyle: React.CSSProperties = {
    padding: '16px',
    textAlign: 'left',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#888',
    fontWeight: '600'
};

const tableCellStyle: React.CSSProperties = {
    padding: '16px',
    verticalAlign: 'middle',
    fontSize: '0.95rem',
    color: '#333'
};

