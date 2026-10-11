import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './AdminSideBar.module.css';
import { getMe, MeResponse } from '../../../Services/userService'; // Điều chỉnh path nếu cần
import { clearAuth } from '../../../Services/authService';     // Điều chỉnh path nếu cần

export default function AdminSideBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [me, setMe] = useState<MeResponse | null>(null);

    useEffect(() => {
        getMe().then(setMe).catch(() => { });
    }, []);

    const navItems = [
        { path: '/admin/dashboard', icon: 'grid_view', label: 'Tổng quan' },
        { path: '/admin/rooms', icon: 'fact_check', label: 'Duyệt tin đăng' },
        { path: '/admin/reports', icon: 'gpp_maybe', label: 'Xử lý báo cáo' },
        { path: '/admin/users', icon: 'manage_accounts', label: 'Quản lý tài khoản' },
        { path: '/admin/statistics', icon: 'monitoring', label: 'Thống kê hệ thống' },
    ];

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            clearAuth();
            navigate('/login');
        }
    };

    const displayName = me?.fullName || me?.username || 'Minh Anh';

    return (
        <aside className={styles.sidebarContainer}>
            <div className={styles.topSection}>
                <div className={styles.logoArea}>
                    <div className={styles.logoGroup}>
                        <img alt="Brand logo" className={styles.logoImage} src="https://lh3.googleusercontent.com/aida/AEtjO1W4BLqhOvlwBL8l2nYA4yAgVRjsyRikQ2iI7RDxVbZ7gBggISPGGBDbieRmFoAZ7tveQw8dbSXRD8IEaR7mQVlMZtxjAgzeFyp0s0-hxwCQSY2j8FZhBumJkM4vMftUKcJCweSC41uudPi1Yo8LCU9CuIlifpU8FH_ZHdh2tXL8QNskx0PDdC_haXeTUj2ZxyuQlOHxlcS1tZqNzGhzhavUC3NEwESqjjVATpItNCfbN-yFUQ0c23k7iAA" />
                        <div className={styles.logoText}>
                            <span className={styles.brandName}>TroTot<span className={styles.brandHighlight}>.vn</span></span>
                            <span className={styles.subBrand}>Quản trị hệ thống</span>
                        </div>
                    </div>
                    <span className={styles.adminBadge}>Admin</span>
                </div>

                <div className={styles.navContainer}>
                    <p className={styles.navTitle}>Bảng điều khiển</p>
                    <nav className={styles.navMenu}>
                        {navItems.map(item => {
                            const isActive = location.pathname.includes(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    <span className={styles.navItemText}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className={styles.profileSection}>
                <div className={styles.profileCard}>
                    <div className={styles.avatarContainer}>
                        <img alt="Admin avatar" className={styles.avatarImage} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAan1IL1Xip1Cra0eLemyGKESC5QynODFg_iAg8IcTP4ZWGkj48hFy-DLnEjrwQ57is-gb4EvUIQhvZPqZARzyZD3GYQgxi_8BEb3Pdz-D-Wc9QIdpqhe-xbP1bqeVBdnFZW8Af1uJfWizzzZf-3rsG97NPsXYtva8XO1amBEKbFkoTT47fDNz9uh7FZW-3SWlzeLZ3N1VBCqAyVmQeiAyvC5v5A4XA11rtreNtHIMz9Sai_anf8NZr" />
                        <span className={styles.statusDot}></span>
                    </div>
                    <div className={styles.profileInfo}>
                        <span className={styles.profileName}>{displayName}</span>
                        <span className={styles.profileRole}>Admin hệ thống</span>
                    </div>
                </div>
                <div className={styles.logoutSection}>
                    <button onClick={handleLogout} className={styles.logoutBtn} type="button">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span>Đăng xuất</span>
                    </button>
                    <span className={styles.versionText}>v2.4.0</span>
                </div>
            </div>
        </aside>
    );
}