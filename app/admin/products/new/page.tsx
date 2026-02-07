'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function NewProduct() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        salePrice: '',
        isOnSale: false,
        sku: '',
        brand: '',
        stock: '',
        categoryId: '',
    });
    const [sizes, setSizes] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [rootCategories, setRootCategories] = useState<any[]>([]);
    const [selectedRootCategory, setSelectedRootCategory] = useState<string>('');
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const router = useRouter();

    const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const AVAILABLE_COLORS = ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Rose', 'Jaune', 'Gris'];
    const AVAILABLE_TAGS = ['Nouveau', 'Tendance', 'Soldes', 'Bestseller'];

    // Fetch root categories on mount
    useEffect(() => {
        fetch('/api/categories?hierarchy=true')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setRootCategories(data);
                } else {
                    console.error('Categories API returned invalid data:', data);
                    setRootCategories([]);
                }
            })
            .catch(err => {
                console.error('Failed to fetch categories:', err);
                setRootCategories([]);
            });
    }, []);

    // Update subcategories when root category changes
    useEffect(() => {
        if (selectedRootCategory) {
            const rootCat = rootCategories.find(cat => cat.id.toString() === selectedRootCategory);
            if (rootCat && rootCat.children) {
                // Flatten all descendants (children and their children)
                const flattenSubcategories = (cats: any[], result: any[] = []) => {
                    cats.forEach(cat => {
                        result.push(cat);
                        if (cat.children && cat.children.length > 0) {
                            flattenSubcategories(cat.children, result);
                        }
                    });
                    return result;
                };
                setSubCategories(flattenSubcategories(rootCat.children));
            } else {
                setSubCategories([]);
            }
            // Reset categoryId when root changes
            setFormData({ ...formData, categoryId: '' });
        } else {
            setSubCategories([]);
        }
    }, [selectedRootCategory, rootCategories]);

    const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
        if (array.includes(item)) {
            setArray(array.filter(i => i !== item));
        } else {
            setArray([...array, item]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoryId) {
            toast.error('Veuillez sélectionner une catégorie');
            return;
        }

        const loadingToast = toast.loading('Création du produit...');

        try {
            let imageUrl = '';
            if (image) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', image);
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formDataUpload,
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    imageUrl = uploadData.url;
                }
            }

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: formData.price,
                    salePrice: formData.salePrice || null,
                    isOnSale: formData.isOnSale,
                    sku: formData.sku || null,
                    brand: formData.brand || null,
                    stock: formData.stock ? parseInt(formData.stock) : null,
                    categoryId: formData.categoryId,
                    imageUrl,
                    sizes: sizes.length > 0 ? sizes : null,
                    colors: colors.length > 0 ? colors : null,
                    tags: tags.length > 0 ? tags : null,
                }),
            });

            if (res.ok) {
                toast.success('Produit créé avec succès !', { id: loadingToast });
                router.push('/admin');
                router.refresh();
            } else {
                const error = await res.json();
                throw new Error(error.details || error.error || 'Erreur inconnue');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erreur lors de la création', { id: loadingToast });
        }
    };

    return (
        <div className="container" style={{ padding: '40px', maxWidth: '800px' }}>
            <h1>Add New Product</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>SKU</label>
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="Unique product code"
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' }}
                    />
                </div>

                {/* Pricing */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Price (DT) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Sale Price (DT)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.salePrice}
                            onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Stock</label>
                        <input
                            type="number"
                            value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="Quantity"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        checked={formData.isOnSale}
                        onChange={e => setFormData({ ...formData, isOnSale: e.target.checked })}
                        id="isOnSale"
                    />
                    <label htmlFor="isOnSale" style={{ fontWeight: '500' }}>Product is on sale</label>
                </div>

                {/* Category Selection - Two Level */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Catégorie Principale *</label>
                        <select
                            value={selectedRootCategory}
                            onChange={e => setSelectedRootCategory(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            <option value="">Sélectionner...</option>
                            {rootCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Sous-Catégorie *</label>
                        <select
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            required
                            disabled={!selectedRootCategory}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: !selectedRootCategory ? '#f5f5f5' : 'white',
                                cursor: !selectedRootCategory ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <option value="">
                                {!selectedRootCategory ? 'Choisir une catégorie principale d\'abord' : 'Sélectionner...'}
                            </option>
                            {subCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Brand</label>
                        <input
                            type="text"
                            value={formData.brand}
                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="e.g., Zara, H&M"
                        />
                    </div>
                </div>

                {/* Sizes */}
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Sizes</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {AVAILABLE_SIZES.map(size => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => toggleArrayItem(sizes, setSizes, size)}
                                style={{
                                    padding: '8px 16px',
                                    border: sizes.includes(size) ? '2px solid #d4af37' : '2px solid #ddd',
                                    background: sizes.includes(size) ? '#d4af37' : 'white',
                                    color: sizes.includes(size) ? '#000' : '#666',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Colors */}
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Colors</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {AVAILABLE_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => toggleArrayItem(colors, setColors, color)}
                                style={{
                                    padding: '8px 16px',
                                    border: colors.includes(color) ? '2px solid #d4af37' : '2px solid #ddd',
                                    background: colors.includes(color) ? '#d4af37' : 'white',
                                    color: colors.includes(color) ? '#000' : '#666',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Tags</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {AVAILABLE_TAGS.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleArrayItem(tags, setTags, tag)}
                                style={{
                                    padding: '8px 16px',
                                    border: tags.includes(tag) ? '2px solid #d4af37' : '2px solid #ddd',
                                    background: tags.includes(tag) ? '#d4af37' : 'white',
                                    color: tags.includes(tag) ? '#000' : '#666',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Product Image</label>
                    <input
                        type="file"
                        onChange={e => setImage(e.target.files?.[0] || null)}
                        accept="image/*"
                        style={{ padding: '10px' }}
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '16px' }}>
                    Create Product
                </button>
            </form>
        </div>
    );
}
