import React from 'react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: string;
    badgeText?: string;
    subDesc?: string;
    progressPercent?: number;
    theme?: 'primary' | 'secondary' | 'error' | 'tertiary';
}

export default function MetricCard({
    title, value, icon, badgeText, subDesc, progressPercent, theme = 'primary'
}: MetricCardProps) {
    const themeConfig = {
        primary: { iconBg: '#eff4ff', iconColor: '#00685f', badgeBg: '#eff4ff', badgeColor: '#00685f', progressBg: '#00685f' },
        secondary: { iconBg: '#f1f5f9', iconColor: '#006398', badgeBg: '#cce5ff', badgeColor: '#00476e', progressBg: '#006398' },
        error: { iconBg: '#ffdad6', iconColor: '#ba1a1a', badgeBg: '#ffdad6', badgeColor: '#93000a', progressBg: '#ba1a1a' },
        tertiary: { iconBg: '#dcfce7', iconColor: '#006947', badgeBg: '#dcfce7', badgeColor: '#005236', progressBg: '#006947' }
    };
    const currentTheme = themeConfig[theme];

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.iconWrapper} style={{ backgroundColor: currentTheme.iconBg, color: currentTheme.iconColor }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{icon}</span>
                </div>
                {badgeText && (
                    <span className={styles.badge} style={{ backgroundColor: currentTheme.badgeBg, color: currentTheme.badgeColor }}>
                        {badgeText}
                    </span>
                )}
            </div>
            <div>
                <span className={styles.title}>{title}</span>
                <div className={styles.valueContainer}>
                    <span className={styles.value} style={{ color: theme === 'error' ? currentTheme.iconColor : '#0b1c30' }}>
                        {value}
                    </span>
                </div>
                {subDesc && <p className={styles.subDesc}>{subDesc}</p>}
            </div>
            {progressPercent !== undefined && (
                <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar} style={{ width: `${progressPercent}%`, backgroundColor: currentTheme.progressBg }}></div>
                </div>
            )}
        </div>
    );
}