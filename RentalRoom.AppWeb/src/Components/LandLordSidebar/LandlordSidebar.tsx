import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './LandlordSidebar.module.css';
import { clearAuth } from '../../Services/authService';

export default function LandlordSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            clearAuth();
            navigate('/login');
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className="flex flex-col">
                {/* Logo */}
                <div className={styles.logoSection}>
                    <img
                        className={styles.logoImg}
                        src="https://lh3.googleusercontent.com/aida/AEtjO1Vqgh5ZAo67JJfGUCcKBai0hvtZ0xgZAVgRLCPW2O5bVaTP_D7GfFNGnKDGoIxU7DSjVMFGqIUB7zqSifvVZohNIq4sJw_dIRNY0fyhOXj_PVDs57eLcO4Cdf8AH8X37LKBqqk4fVAhfvWOQzO4JCkNZhFOJbJd1wNSoh4KcyluV8d8mwx7LrVTJLIrTJVKBmOK5cH47VpcKgpRh8EujRnNf6WRsfxoAh_rsGZclY07EGgHvntB5lx7EuA"
                        alt=""
                    />
                    <span className={styles.brandName}>TroTot.vn</span>
                    <span className={styles.roleBadge}>Chủ trọ</span>
                </div>

                {/* Menu */}
                <nav className={styles.nav}>
                    <button
                        className={`${styles.navItem} ${isActive('/landlord/dashboard') ? styles.navItemActive : ''}`}
                        onClick={() => navigate('/landlord/dashboard')}
                    >
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        <span>Tổng quan</span>
                    </button>

                    <button
                        className={`${styles.navItem} ${isActive('/landlord/listings') ? styles.navItemActive : ''}`}
                        onClick={() => navigate('/landlord/listings')}
                    >
                        <span className="material-symbols-outlined text-[20px]">real_estate_agent</span>
                        <span>Tin của tôi</span>
                    </button>

                    <button
                        className={`${styles.navItem} ${isActive('/create-room') ? styles.navItemActive : ''}`}
                        onClick={() => navigate('/create-room')}
                    >
                        <span className="material-symbols-outlined text-[20px]">post_add</span>
                        <span>Đăng tin mới</span>
                    </button>

                    <button
                        className={`${styles.navItem} ${isActive('/landlord/profile') ? styles.navItemActive : ''}`}
                        onClick={() => navigate('/landlord/profile')}
                    >
                        <span className="material-symbols-outlined text-[20px]">account_circle</span>
                        <span>Tài khoản</span>
                    </button>
                </nav>
            </div>

            {/* Đăng xuất */}
            <div className={styles.bottomSection}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}