'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Header.module.css';
import CartButton from './CartButton';
import { useI18n } from './I18nContext';
import { useAuth } from './AuthContext';
import NotificationBell from './NotificationBell';

const MobileMenuCategory = ({ category, closeMenu, level = 0 }: { category: any, closeMenu: () => void, level?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className={styles.categoryItem} style={{ paddingLeft: `${level * 20}px` }}>
            <div className={styles.categoryHeader}>
                <Link
                    href={`/shop?category=${category.id}`}
                    className={`${styles.categoryLink} ${level === 0 ? styles.categoryLinkRoot : styles.categoryLinkSub}`}
                    onClick={closeMenu}
                >
                    {category.name}
                </Link>
                {hasChildren && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={styles.expandBtn}
                        aria-label={isOpen ? 'Réduire' : 'Développer'}
                    >
                        {isOpen ? '−' : '+'}
                    </button>
                )}
            </div>
            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={styles.categoryChildren}
                    >
                        {category.children.map((child: any) => (
                            <MobileMenuCategory
                                key={child.id}
                                category={child}
                                closeMenu={closeMenu}
                                level={level + 1}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const { locale, setLocale, t } = useI18n();
    const { user, logout } = useAuth();

    // Fetch categories on mount
    useEffect(() => {
        fetch('/api/categories?hierarchy=true')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    console.error('Categories API returned invalid data:', data);
                    setCategories([]);
                }
            })
            .catch(err => {
                console.error('Failed to fetch categories:', err);
                setCategories([]);
            });
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

    const handleLogout = async () => {
        await logout();
        setIsUserMenuOpen(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Left: Mobile Menu & Desktop Nav */}
                <div className={styles.navLeft}>
                    <button className={styles.mobileMenuBtn} onClick={toggleMenu} aria-label="Menu">
                        <Menu size={24} strokeWidth={1} />
                    </button>

                    <nav className={styles.desktopNav}>
                        <Link href="/shop?filter=new" className={styles.link}>
                            Nouveautés
                        </Link>
                        <Link href="/shop" className={styles.link}>
                            Collection
                        </Link>
                        <Link href="/shop?filter=sale" className={styles.link}>
                            Soldes
                        </Link>
                    </nav>
                </div>

                {/* Center: Logo */}
                <Link href="/" className={styles.logo}>
                    <img src="/uploads/logo-manel.png" alt="Lillistyle" style={{ height: '90px' }} />
                </Link>

                {/* Right: Actions */}
                <div className={styles.actions}>
                    {/* Language Switcher - Simplified */}
                    <div className={styles.langSwitcher}>
                        <button onClick={() => setLocale('fr')} className={`${styles.langBtn} ${locale === 'fr' ? styles.activeLang : ''}`}>FR</button>
                        <button onClick={() => setLocale('en')} className={`${styles.langBtn} ${locale === 'en' ? styles.activeLang : ''}`}>EN</button>
                    </div>

                    <div className={styles.userMenu}>
                        <button onClick={toggleUserMenu} className={styles.userBtn} aria-label="Compte">
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '8px', display: 'none' }}>Compte</span>
                            <User size={22} strokeWidth={1} />
                        </button>
                        {isUserMenuOpen && (
                            <div className={styles.userDropdown}>
                                {user ? (
                                    <>
                                        <Link href="/account" onClick={() => setIsUserMenuOpen(false)}>Mon Compte</Link>
                                        <Link href="/wishlist" onClick={() => setIsUserMenuOpen(false)}>Ma Wishlist</Link>
                                        <button onClick={handleLogout}>Déconnexion</button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/login" onClick={() => setIsUserMenuOpen(false)}>Connexion</Link>
                                        <Link href="/auth/register" onClick={() => setIsUserMenuOpen(false)}>Créer un compte</Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {user && <NotificationBell />}
                    <CartButton />
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className={styles.mobileOverlay}
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className={styles.overlayHeader}>
                            <button onClick={toggleMenu} className={styles.closeBtn}>
                                <X size={32} />
                            </button>
                        </div>
                        <nav className={styles.mobileNav}>
                            <Link href="/shop?filter=new" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                Nouveautés
                            </Link>
                            <Link href="/shop" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                Collection
                            </Link>
                            <Link href="/shop?filter=sale" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                Soldes
                            </Link>

                            <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e5e5e5', width: '100%' }} />

                            <div style={{ width: '100%', marginBottom: '15px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 'bold' }}>Catégories</span>
                            </div>

                            {categories.map((category) => (
                                <MobileMenuCategory
                                    key={category.id}
                                    category={category}
                                    closeMenu={() => setIsMenuOpen(false)}
                                />
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
