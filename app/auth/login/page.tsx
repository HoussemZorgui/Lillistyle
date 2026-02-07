'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useI18n } from '@/components/I18nContext';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { t } = useI18n();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result?.isAdmin) {
                router.push('/admin');
            } else {
                router.push('/account');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Connexion</h1>
                <p className={styles.subtitle}>Bienvenue ! Connectez-vous à votre compte</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="votre@email.com"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Pas encore de compte ?{' '}
                    <Link href="/auth/register" className={styles.link}>
                        Créer un compte
                    </Link>
                </p>
            </div>
        </div>
    );
}
