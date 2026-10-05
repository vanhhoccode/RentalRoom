import React from 'react';
import styles from './KPICard.module.css';

interface KPICardProps {
    label: string;
    value: string | number;
    icon: string;
    theme?: 'primary' | 'secondary' | 'error' | 'neutral';
    badgeText?: string;
}

export default function KPICard({ label, value, icon, theme = 'neutral', badgeText }: KPICardProps) {
    const themeClass = {
        primary: styles.themePrimary,
        secondary: styles.themeSecondary,
        error: styles.themeError,
        neutral: styles.themeNeutral,
    }[theme];

    return (
        <div className={`${styles.card} ${themeClass}`}>
            <div className={styles.content}>
                <span className={styles.label}>{label}</span>
                <div className={styles.valueWrapper}>
                    <span className={styles.value}>{value}</span>
                    {badgeText && (
                        <span className={styles.badge}>{badgeText}</span>
                    )}
                </div>
            </div>
            <div className={styles.iconBox}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
        </div>
    );
}