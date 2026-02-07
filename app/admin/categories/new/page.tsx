'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCategory() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let imageUrl = '';
        if (image) {
            const formData = new FormData();
            formData.append('file', image);
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadRes.json();
            if (uploadData.success) {
                imageUrl = uploadData.url;
            }
        }

        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, imageUrl }),
        });

        if (res.ok) {
            router.push('/admin');
            router.refresh();
        }
    };

    return (
        <div className="container" style={{ padding: '40px', maxWidth: '600px' }}>
            <h1>Add New Category</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label>Category Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                    />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                        rows={4}
                    />
                </div>
                <div>
                    <label>Image</label>
                    <input
                        type="file"
                        onChange={e => setImage(e.target.files?.[0] || null)}
                        style={{ marginTop: '5px' }}
                        accept="image/*"
                    />
                </div>
                <button type="submit" className="btn btn-primary">Create Category</button>
            </form>
        </div>
    );
}
