import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.leftGroup}>
                <div className={styles.breadcrumb}>
                    <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                    <span>Portal</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className={styles.breadcrumbText}>Hệ thống quản lý</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.systemBadge}>
                    <span className={styles.pulseDot}></span>
                    <span>Hệ thống vận hành 24/7 • Real-time</span>
                </div>
            </div>

            <div className={styles.rightGroup}>
                <Link to="/" className={styles.homeLink}>
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    <span>Về trang chủ TroTot</span>
                </Link>
                <div className="relative">
                    <button className={styles.notificationBtn} type="button">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                    </button>
                    <span className={styles.notificationDot}></span>
                </div>
                <img alt="Profile" className={styles.avatarImg} src="https://lh3.googleusercontent.com/aida/AEtjO1W2r_j4wc9RUqfly9Q6F04n1n3WcN4UyDequWJYtRofjauszELWWn-wn9r3yt2OtXKNNGz9dLUfVgwG7FOq_1EfM_kvDUM-CHPtBJhUwoXkF3Ms87RI_9PIYLPnUSa7lD5yUrq3lgWnDWuxsGx6fdLqDlutRrZ3xDJcvfmLIo94v6HxyHIRSm3X2hUL3k9XR__NagFgBrgJTMVKFiKogfTs-w1RyExXSPjBpNp2BGFt680TsyFvDOeFHw" />
            </div>
        </header>
    );
}