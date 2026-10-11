import React from 'react';
import AdminSideBar from '../AdminSideBar/AdminSidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className={styles.layoutContainer}>
            <AdminSideBar />
            <div className={styles.contentWrapper}>
                <AdminHeader />
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
        </div>
    );
}