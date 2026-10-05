import React, { ReactNode } from 'react';
import styles from './SectionBlock.module.css';

export interface SectionBlockProps {
    title: string;
    stepNumber?: number | string; // Hiển thị số (1, 2, 3) dùng cho Form
    icon?: string;                // Hiển thị Icon dùng cho trang Chi tiết
    rightElement?: ReactNode;     // Badge "Bắt buộc" hoặc Text phụ bên phải
    children: ReactNode;
    className?: string;
}

export default function SectionBlock({
    title,
    stepNumber,
    icon,
    rightElement,
    children,
    className = ''
}: SectionBlockProps) {
    return (
        <section className={`${styles.sectionWrapper} ${className}`}>
            {/* Header của Khối */}
            <div className={styles.headerRow}>
                <div className={styles.titleGroup}>
                    {stepNumber && (
                        <span className={styles.iconBox}>{stepNumber}</span>
                    )}
                    {!stepNumber && icon && (
                        <span className={`material-symbols-outlined ${styles.iconOnly}`}>{icon}</span>
                    )}
                    <h2 className={styles.title}>{title}</h2>
                </div>

                {/* Phần tử phụ bên phải (nếu có) */}
                {rightElement && (
                    <div className={styles.rightContent}>
                        {rightElement}
                    </div>
                )}
            </div>

            {/* Nội dung bên trong */}
            <div>{children}</div>
        </section>
    );
}