import React from 'react';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    subtitle?: string;
    icon?: string;
    theme?: 'primary' | 'error';
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm: () => void;
    children?: React.ReactNode;
}

export default function ConfirmModal({
    isOpen, title, subtitle, icon = 'info', theme = 'primary', confirmText = 'Xác nhận', cancelText = 'Hủy bỏ', onClose, onConfirm, children
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={`${styles.iconBox} ${theme === 'error' ? styles.iconBoxError : styles.iconBoxPrimary}`}>
                            <span className="material-symbols-outlined">{icon}</span>
                        </div>
                        <div>
                            <h3 className={styles.title}>{title}</h3>
                            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>

                <div className={styles.body}>
                    {children}
                </div>

                <div className={styles.footer}>
                    <button className={styles.btnCancel} onClick={onClose}>{cancelText}</button>
                    <button
                        className={`${styles.btnConfirm} ${theme === 'error' ? styles.btnConfirmError : styles.btnConfirmPrimary}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}