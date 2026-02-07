'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import styles from './reviews.module.css';
import { useAuth } from '@/components/AuthContext';

interface Review {
    id: number;
    rating: number;
    title?: string;
    comment?: string;
    createdAt: string;
    user: {
        firstName?: string;
        lastName?: string;
    };
}

interface ProductReviewsProps {
    productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        title: '',
        comment: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?productId=${productId}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews);
                setAverageRating(data.averageRating);
                setTotalReviews(data.totalReviews);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    ...formData,
                }),
            });

            if (response.ok) {
                setFormData({ rating: 5, title: '', comment: '' });
                setShowForm(false);
                fetchReviews();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to submit review');
            }
        } catch (err) {
            setError('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
        return (
            <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={interactive ? 24 : 16}
                        fill={star <= rating ? 'var(--primary)' : 'none'}
                        stroke={star <= rating ? 'var(--primary)' : '#ccc'}
                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                        onClick={() => interactive && onRate && onRate(star)}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className={styles.loading}>Chargement des avis...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Avis Clients</h2>
                {totalReviews > 0 && (
                    <div className={styles.summary}>
                        {renderStars(Math.round(averageRating))}
                        <span className={styles.avgRating}>{averageRating.toFixed(1)}/5</span>
                        <span className={styles.totalReviews}>({totalReviews} avis)</span>
                    </div>
                )}
            </div>

            {user && !showForm && (
                <button onClick={() => setShowForm(true)} className="btn btn-outline" style={{ marginBottom: '20px' }}>
                    Écrire un avis
                </button>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h3>Votre Avis</h3>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.field}>
                        <label>Note *</label>
                        {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="title">Titre</label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Résumez votre expérience"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="comment">Commentaire</label>
                        <textarea
                            id="comment"
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            placeholder="Partagez votre avis sur ce produit"
                            rows={4}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Envoi...' : 'Publier'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                            Annuler
                        </button>
                    </div>
                </form>
            )}

            <div className={styles.reviews}>
                {reviews.length === 0 ? (
                    <p className={styles.noReviews}>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className={styles.review}>
                            <div className={styles.reviewHeader}>
                                <div>
                                    <strong>{review.user.firstName || 'Client'} {review.user.lastName?.[0] || ''}.</strong>
                                    {renderStars(review.rating)}
                                </div>
                                <span className={styles.date}>
                                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                            {review.title && <h4 className={styles.reviewTitle}>{review.title}</h4>}
                            {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
