'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Category {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    parentId?: number;
    children?: Category[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        parentId: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories?hierarchy=true');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            description: formData.description || null,
            imageUrl: formData.imageUrl || null,
            parentId: formData.parentId ? parseInt(formData.parentId) : null
        };

        const loadingToast = toast.loading(editingCategory ? 'Mise à jour...' : 'Création...');

        try {
            if (editingCategory) {
                // Update
                const res = await fetch(`/api/categories/${editingCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.details || 'Erreur lors de la mise à jour');
                }

                toast.success('Catégorie mise à jour avec succès !', { id: loadingToast });
            } else {
                // Create
                const res = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.details || 'Erreur lors de la création');
                }

                toast.success('Catégorie créée avec succès !', { id: loadingToast });
            }

            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', imageUrl: '', parentId: '' });
            fetchCategories();
        } catch (error: any) {
            console.error('Error saving category:', error);
            toast.error(error.message || 'Erreur lors de la sauvegarde', { id: loadingToast });
        }
    };

    const handleDelete = (id: number) => {
        toast((t) => (
            <div style={{ padding: '8px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '500' }}>
                    Êtes-vous sûr de vouloir supprimer cette catégorie ?
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
                backgroundColor: '#fff'
            }
        });
    };

    const executeDelete = async (id: number) => {
        const loadingToast = toast.loading('Suppression en cours...');

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.details || 'Erreur lors de la suppression');
            }

            toast.success('Catégorie supprimée avec succès !', {
                id: loadingToast,
                duration: 3000
            });
            fetchCategories();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error(error.message || 'Erreur lors de la suppression', {
                id: loadingToast,
                duration: 4000
            });
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            imageUrl: category.imageUrl || '',
            parentId: category.parentId?.toString() || ''
        });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '', imageUrl: '', parentId: '' });
        setShowModal(true);
    };

    // Flatten categories for parent selection
    const flattenCategories = (cats: Category[], level = 0, result: any[] = []): any[] => {
        cats.forEach(cat => {
            result.push({ ...cat, level });
            if (cat.children && cat.children.length > 0) {
                flattenCategories(cat.children, level + 1, result);
            }
        });
        return result;
    };

    const renderCategory = (category: Category, level = 0) => {
        return (
            <div key={category.id}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px 20px',
                        borderBottom: '1px solid #eee',
                        backgroundColor: level === 0 ? '#fafafa' : level === 1 ? '#fff' : '#f9f9f9',
                        paddingLeft: `${20 + level * 40}px`
                    }}
                >
                    {level > 0 && <ChevronRight size={16} style={{ marginRight: '10px', color: '#999' }} />}

                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: level === 0 ? '600' : '500', fontSize: level === 0 ? '1.05rem' : '0.95rem' }}>
                            {category.name}
                        </div>
                        {category.description && (
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                {category.description}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => handleEdit(category)}
                            style={{
                                padding: '8px 12px',
                                background: '#f0f0f0',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <Edit2 size={16} />
                            Modifier
                        </button>
                        <button
                            onClick={() => handleDelete(category.id)}
                            style={{
                                padding: '8px 12px',
                                background: '#fee',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: '#c00'
                            }}
                        >
                            <Trash2 size={16} />
                            Supprimer
                        </button>
                    </div>
                </div>

                {category.children && category.children.map(child => renderCategory(child, level + 1))}
            </div>
        );
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#fff',
                        color: '#333',
                        padding: '16px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        fontSize: '0.95rem',
                        fontWeight: '500'
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                        duration: 4000
                    },
                }}
            />
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Gestion des Catégories</h1>
                    <button
                        onClick={handleAddNew}
                        style={{
                            padding: '12px 24px',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '500'
                        }}
                    >
                        <Plus size={20} />
                        Nouvelle Catégorie
                    </button>
                </div>

                <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {categories.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
                            Aucune catégorie. Cliquez sur "Nouvelle Catégorie" pour commencer.
                        </div>
                    ) : (
                        categories.map(cat => renderCategory(cat))
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#fff',
                            borderRadius: '8px',
                            padding: '30px',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
                                {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '1rem',
                                            minHeight: '80px'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        URL de l'image
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '1rem'
                                        }}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Catégorie Parente (optionnel)
                                    </label>
                                    <select
                                        value={formData.parentId}
                                        onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option value="">Aucune (Catégorie Racine)</option>
                                        {flattenCategories(categories)
                                            .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {'—'.repeat(cat.level)} {cat.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingCategory(null);
                                        }}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#f0f0f0',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '10px 20px',
                                            background: '#000',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {editingCategory ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
