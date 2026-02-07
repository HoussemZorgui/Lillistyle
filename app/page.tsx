'use client';

import Link from 'next/link';
import styles from './page.module.css';
import AnimatedSection from '@/components/AnimatedSection';
import { useI18n } from '@/components/I18nContext';
import { useEffect, useState } from 'react';

export default function Home() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.slice(0, 3)));
  }, []);

  return (
    <div className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}>
          <AnimatedSection className={styles.heroContent} delay={0.5}>
            <span className={styles.label}>{t('hero.label')}</span>
            <h1 className={styles.title}>Lillistyle : L'Élégance de la Mode pour Toute la Famille</h1>
            <p className={styles.subtitle}>{t('hero.subtitle')}</p>
            <div className={styles.heroButtons}>
              <Link href="/shop" className="btn btn-primary">{t('hero.shop_now')}</Link>
              <Link href="/shop?category=children" className="btn btn-outline">{t('hero.children_collection')}</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Philosophy Section */}
      <AnimatedSection className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 className={styles.sectionTitle}>{t('home.philosophy_title')}</h2>
        <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
          {t('home.philosophy_text')}
        </p>
      </AnimatedSection>

      {/* Categories Grid */}
      <section className={styles.categoriesSection}>
        <div className="container">
          <AnimatedSection>
            <h2 className={styles.sectionTitle}>{t('home.collections_title')}</h2>
          </AnimatedSection>

          <div className={styles.categoryGrid}>
            {categories.length === 0 ? (
              <p style={{ textAlign: 'center', gridColumn: '1/-1', opacity: 0.5 }}>{t('home.no_collections')}</p>
            ) : (
              categories.map((cat: any, index: number) => (
                <AnimatedSection key={cat.id} className={styles.categoryCard} delay={0.2 * (index + 1)}>
                  <div
                    className={styles.catImage}
                    style={{
                      backgroundImage: cat.imageUrl ? `url(${cat.imageUrl})` : 'none',
                      backgroundColor: '#f5f5f5'
                    }}
                  ></div>
                  <div className={styles.catContent}>
                    <h3>{cat.name}</h3>
                    <Link href={`/shop?category=${cat.id}`}>{t('home.explore')}</Link>
                  </div>
                </AnimatedSection>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter / Footer Promo */}
      <AnimatedSection style={{ background: '#0a0a0a', color: 'white', padding: '80px 20px', textAlign: 'center', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '20px' }}>{t('footer.newsletter_title')}</h2>
          <p style={{ marginBottom: '30px', opacity: 0.8 }}>{t('footer.newsletter_subtitle')}</p>
          <form style={{ display: 'flex', gap: '10px', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <input type="email" placeholder={t('footer.email_placeholder') || "Votre adresse e-mail"} style={{ padding: '15px', borderRadius: '4px', border: 'none', flex: 1 }} />
            <button className="btn btn-primary">{t('footer.subscribe')}</button>
          </form>
        </div>
      </AnimatedSection>
    </div>
  );
}
