'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/auth/login');
    }, [router]);

    return (
        <div style={{ padding: '80px', textAlign: 'center' }}>
            <p>Redirection vers la page de connexion unifiée...</p>
        </div>
    );
}
