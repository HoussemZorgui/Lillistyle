'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export default function DeleteProductButton({ id }: { id: number }) {
    const router = useRouter();

    const handleDelete = () => {
        toast((t) => (
            <div style={{ padding: '8px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '500' }}>
                    Êtes-vous sûr de vouloir supprimer ce produit ?
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            padding: '6px 12px',
                            background: '#f3f4f6',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            executeDelete(id);
                        }}
                        style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center',
            style: {
                minWidth: '320px',
                border: '1px solid #fee2e2',
                backgroundColor: '#fff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
        });
    };

    const executeDelete = async (id: number) => {
        const loadingToast = toast.loading('Suppression en cours...');

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                toast.success('Produit supprimé avec succès !', {
                    id: loadingToast,
                    duration: 3000
                });
                router.refresh();
            } else {
                toast.error(data.details || 'Erreur lors de la suppression', {
                    id: loadingToast
                });
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression', {
                id: loadingToast
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            style={{
                background: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                padding: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
            }}
            title="Supprimer"
        >
            <Trash2 size={18} />
        </button>
    );
}
