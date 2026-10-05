import React, { useEffect } from 'react';
import styles from './Toast.module.css';

export interface ToastProps {
    isOpen: boolean;
    type?: 'success' | 'error' | 'info';
    title?: string;
    message: string;
    duration?: number;
    onClose: () => void;
}

export default function Toast({
    isOpen,
    type = 'success',
    title,
    message,
    duration = 4000,
    onClose
}: ToastProps) {

    // Tự động đóng sau X giây
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    const typeConfig = {
        success: { iconStyle: styles.iconSuccess, icon: 'task_alt', defaultTitle: 'Thành công!' },
        error: { iconStyle: styles.iconError, icon: 'error', defaultTitle: 'Đã xảy ra lỗi' },
        info: { iconStyle: styles.iconInfo, icon: 'info', defaultTitle: 'Thông báo' },
    };

    const currentConfig = typeConfig[type];

    return (
        <div className={`${styles.toastWrapper} ${isOpen ? styles.toastEnter : styles.toastExit}`}>
            <div className={`${styles.iconBox} ${currentConfig.iconStyle}`}>
                <span className="material-symbols-outlined text-[22px]">{currentConfig.icon}</span>
            </div>

            <div className={styles.content}>
                <span className={styles.title}>{title || currentConfig.defaultTitle}</span>
                <p className={styles.message}>{message}</p>
            </div>

            <button className={styles.btnClose} onClick={onClose} aria-label="Đóng">
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    );
}