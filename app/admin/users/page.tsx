'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Trash2, Shield, User, MapPin } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = () => {
        setLoading(true);
        fetch('/api/admin/users')
            .then(res => {
                if (!res.ok) throw new Error('Unauthorized or failed to fetch');
                return res.json();
            })
            .then(data => {
                setUsers(data.users);
                setLoading(false);
            })
            .catch(err => {
                toast.error(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteUser = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        const loadingToast = toast.loading('Suppression...');
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Utilisateur supprimé', { id: loadingToast });
                setUsers(users.filter(u => u.id !== id));
            } else {
                // If there's an error message from the API, use it
                throw new Error(data.details || data.error || 'Failed to delete');
            }
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast, duration: 4000 });
        }
    };

    const toggleRole = async (user: any) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const loadingToast = toast.loading(`Passage en ${newRole}...`);

        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success(`Rôle mis à jour : ${newRole}`, { id: loadingToast });
                setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
            } else {
                throw new Error('Failed to update role');
            }
        } catch (error) {
            toast.error('Erreur lors de la mise à jour', { id: loadingToast });
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Chargement des utilisateurs...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Gestion des Utilisateurs</h1>
                    <p style={{ color: '#666' }}>Gérez les comptes utilisateurs et leurs rôles</p>
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
                            <th style={tableHeaderStyle}>Utilisateur</th>
                            <th style={tableHeaderStyle}>Email</th>
                            <th style={tableHeaderStyle}>Rôle</th>
                            <th style={tableHeaderStyle}>Date d'inscription</th>
                            <th style={tableHeaderStyle}>Commandes</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={tableCellStyle}>#{user.id}</td>
                                <td style={tableCellStyle}>
                                    <div style={{ fontWeight: '500' }}>{user.firstName} {user.lastName}</div>
                                </td>
                                <td style={tableCellStyle}>{user.email}</td>
                                <td style={tableCellStyle}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        background: user.role === 'ADMIN' ? '#d1f2eb' : '#f0f0f0',
                                        color: user.role === 'ADMIN' ? '#0e6251' : '#333'
                                    }}>
                                        {user.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td style={tableCellStyle}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td style={tableCellStyle}>
                                    {user._count?.orders || 0}
                                </td>
                                <td style={tableCellStyle}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => toggleRole(user)}
                                            style={{
                                                padding: '6px',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd',
                                                background: '#fff',
                                                cursor: 'pointer',
                                                color: '#f39c12'
                                            }}
                                            title="Changer le rôle"
                                        >
                                            <Shield size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            style={{
                                                padding: '6px',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd',
                                                background: '#fff',
                                                cursor: 'pointer',
                                                color: '#e74c3c'
                                            }}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
