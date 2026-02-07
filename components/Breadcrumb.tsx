'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './breadcrumb.module.css';

export default function Breadcrumb() {
    const pathname = usePathname();

    const pathSegments = pathname.split('/').filter(segment => segment);

    const breadcrumbs = [
        { name: 'Accueil', href: '/' },
        ...pathSegments.map((segment, index) => {
            const href = '/' + pathSegments.slice(0, index + 1).join('/');
            const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            return { name, href };
        }),
    ];

    if (breadcrumbs.length <= 1) return null;

    return (
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <ol className={styles.list}>
                {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.href} className={styles.item}>
                        {index < breadcrumbs.length - 1 ? (
                            <>
                                <Link href={crumb.href} className={styles.link}>
                                    {crumb.name}
                                </Link>
                                <span className={styles.separator}>/</span>
                            </>
                        ) : (
                            <span className={styles.current}>{crumb.name}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
