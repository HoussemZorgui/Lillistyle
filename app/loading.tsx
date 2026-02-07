import styles from './loading.module.css';

export default function Loading() {
    return (
        <div className={styles.container}>
            <div className={styles.loader}>
                <div className={styles.spinner}></div>
                <div className={styles.logoText}>LILLISTYLE</div>
            </div>
        </div>
    );
}
