import React, { InputHTMLAttributes } from 'react';
import styles from './SelectCard.module.css';

export interface SelectCardProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: string;
    variant?: 'vertical' | 'horizontal'; // vertical cho Radio to, horizontal cho Checkbox tiện ích
    lightActive?: boolean; // Nếu true, khi active sẽ dùng nền nhạt (dùng cho checkbox tiện ích)
}

export default function SelectCard({
    label,
    icon,
    variant = 'horizontal',
    lightActive = false,
    className = '',
    checked,
    type = 'radio',
    ...props
}: SelectCardProps) {

    // Xác định class layout
    const layoutClass = variant === 'vertical' ? styles.variantVertical : styles.variantHorizontal;
    const iconSizeClass = variant === 'vertical' ? styles.iconVertical : styles.iconHorizontal;
    const textSizeClass = variant === 'vertical' ? styles.textVertical : styles.textHorizontal;

    // Xác định class trạng thái
    let stateClass = styles.stateInactive;
    if (checked) {
        stateClass = lightActive ? styles.stateActiveLight : styles.stateActive;
    }

    return (
        <label className={`${styles.labelBase} ${layoutClass} ${stateClass} ${className}`}>
            {/* Input gốc bị ẩn đi nếu là dạng vertical, hoặc hiện custom nếu là horizontal */}
            {variant === 'vertical' ? (
                <input type={type} className="hidden" checked={checked} {...props} />
            ) : (
                <input type={type} className={styles.customCheckbox} checked={checked} {...props} />
            )}

            <span className={`material-symbols-outlined ${styles.icon} ${iconSizeClass}`}>
                {icon}
            </span>
            <span className={`${styles.text} ${textSizeClass}`}>
                {label}
            </span>
        </label>
    );
}