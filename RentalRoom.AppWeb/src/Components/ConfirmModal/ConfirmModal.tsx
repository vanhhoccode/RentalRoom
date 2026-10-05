import React, { ReactNode } from 'react';
import styles from './ConfirmModal.module.css';

export interface ConfirmModalProps {
    isOpen: boolean;
    type?: 'danger' | 'success' | 'warning';
    icon?: string;
    title: string;
    description: ReactNode;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmModal({
    isOpen,
    type = 'success',
    icon,
    title,
    description,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    isLoading = false,
    onConfirm,
    onClose
}: ConfirmModalProps) {
    if (!isOpen) return null;

    // Cấu hình UI theo Type
    const typeConfig = {
        danger: { iconStyle: styles.iconDanger, defaultIcon: 'delete_forever', btnStyle: styles.btnConfirmDanger },
        success: { iconStyle: styles.iconSuccess, defaultIcon: 'check_circle', btnStyle: styles.btnConfirmSuccess },
        warning: { iconStyle: styles.iconWarning, defaultIcon: 'warning', btnStyle: styles.btnConfirmDanger },
    };

    const currentConfig = typeConfig[type];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.modalContent} animate-in fade-in zoom-in-95`}
                onClick={(e) => e.stopPropagation()} // Chặn đóng modal khi click vào content
            >
                <div className={styles.header}>
                    <div className={`${styles.iconWrapper} ${currentConfig.iconStyle}`}>
                        <span className="material-symbols-outlined text-[28px]">
                            {icon || currentConfig.defaultIcon}
                        </span>
                    </div>
                    <div className={styles.textContainer}>
                        <h3 className={styles.title}>{title}</h3>
                        <div className={styles.description}>{description}</div>
                    </div>
                </div>

                <div className={styles.actionGroup}>
                    <button
                        className={styles.btnCancel}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.btnConfirm} ${currentConfig.btnStyle}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">check</span>
                        )}
                        <span>{isLoading ? 'Đang xử lý...' : confirmText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}