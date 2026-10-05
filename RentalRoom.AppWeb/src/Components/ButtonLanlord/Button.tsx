import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    leftIcon?: string;  // Tên icon Material Symbols
    rightIcon?: string; // Tên icon Material Symbols
    isLoading?: boolean;
    children?: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {

    // Ánh xạ class tương ứng
    const variantClass = {
        primary: styles.variantPrimary,
        secondary: styles.variantSecondary,
        danger: styles.variantDanger,
        ghost: styles.variantGhost,
    }[variant];

    const sizeClass = {
        sm: styles.sizeSm,
        md: styles.sizeMd,
        lg: styles.sizeLg,
        icon: styles.sizeIcon,
    }[size];

    return (
        <button
            className={`${styles.btnBase} ${variantClass} ${sizeClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Loading Spinner hoặc Left Icon */}
            {isLoading ? (
                <span className={styles.spinner}>progress_activity</span>
            ) : leftIcon ? (
                <span className={`material-symbols-outlined ${styles.icon}`}>{leftIcon}</span>
            ) : null}

            {/* Content */}
            {children && <span>{children}</span>}

            {/* Right Icon (ẩn nếu đang loading để tránh rối) */}
            {!isLoading && rightIcon && (
                <span className={`material-symbols-outlined ${styles.icon}`}>{rightIcon}</span>
            )}
        </button>
    );
}