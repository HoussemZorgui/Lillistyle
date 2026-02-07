'use client';

import Link from 'next/link';
import styles from './Footer.module.css';
import { useI18n } from './I18nContext';

export default function Footer() {
    const { t } = useI18n();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.column}>
                    <div className={styles.logoWrapper}>
                        <img src="/uploads/logo-manel.png" alt="Lillistyle Logo" className={styles.logoImage} />
                    </div>
                    <p className={styles.description}>
                        {t('footer.description') || "Providing distinct fashion for the modern era. We blend timeless elegance with contemporary design to create pieces that tell a story."}
                    </p>
                    <div className={styles.socials}>
                        <a href="#" className={styles.socialLink}>FB</a>
                        <a href="#" className={styles.socialLink}>IG</a>
                        <a href="#" className={styles.socialLink}>TW</a>
                        <a href="#" className={styles.socialLink}>PI</a>
                    </div>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>{t('footer.shopping') || "Shopping"}</h4>
                    <ul className={styles.list}>
                        <li><Link href="/shop?category=women">{t('nav.women')}</Link></li>
                        <li><Link href="/shop?category=children">{t('nav.children')}</Link></li>
                        <li><Link href="/shop">{t('nav.arrivals')}</Link></li>
                        <li><Link href="/shop">{t('nav.sale')}</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>{t('footer.customer_care')}</h4>
                    <ul className={styles.list}>
                        <li><Link href="#">{t('footer.contact')}</Link></li>
                        <li><Link href="#">Livraison & Retours</Link></li>
                        <li><Link href="#">Guide des tailles</Link></li>
                        <li><Link href="#">FAQ</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>{t('footer.contact')}</h4>
                    <div className={styles.contactItem}>
                        <span>123 Avenue de la Mode, Paris, France</span>
                    </div>
                    <div className={styles.contactItem}>
                        <span>+33 1 23 45 67 89</span>
                    </div>
                    <div className={styles.contactItem}>
                        <span>contact@lillistyle.com</span>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className={styles.bottomBar}>
                    <p>&copy; {new Date().getFullYear()} Lillistyle. Tout droits réservés.</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Link href="#">Politique de confidentialité</Link>
                        <Link href="#">Conditions d'utilisation</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
