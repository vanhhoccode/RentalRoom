import React, { useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
    show: boolean;
    title: string;
    desc: string;
    isError?: boolean;
    onClose: () => void;
}

export default function Toast({ show, title, desc, isError = false, onClose }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => onClose(), 4500);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className={`${styles.toastContainer} ${isError ? styles.toastError : styles.toastSuccess}`}>
            <span className={`material-symbols-outlined ${styles.icon} ${isError ? styles.iconError : styles.iconSuccess}`}>
                {isError ? 'feedback' : 'check_circle'}
            </span>
            <div className={styles.content}>
                <span className={styles.title}>{title}</span>
                {desc && <span className={styles.desc}>{desc}</span>}
            </div>
        </div>
    );
}