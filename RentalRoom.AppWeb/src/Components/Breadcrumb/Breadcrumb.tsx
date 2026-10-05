import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: string; // Tên icon (vd: 'home', 'domain')
    isBadge?: boolean; // Hiển thị dạng thẻ highlight ở cuối (giống UI chi tiết phòng)
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: string; // Mặc định dùng '/', có thể đổi thành 'chevron_right'
}

export default function Breadcrumb({ items, separator = '/' }: BreadcrumbProps) {
    const navigate = useNavigate();

    return (
        <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={index}>
                        {/* Hiển thị Item */}
                        {isLast ? (
                            // Mục cuối cùng (Active)
                            <span className={item.isBadge ? styles.itemActiveBadge : styles.itemActive}>
                                {item.icon && <span className={`material-symbols-outlined ${styles.icon}`}>{item.icon}</span>}
                                {item.label}
                            </span>
                        ) : (
                            // Các mục có link
                            <a
                                className={styles.itemLink}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (item.href) navigate(item.href);
                                }}
                                href={item.href || '#'}
                            >
                                {item.icon && <span className={`material-symbols-outlined ${styles.icon}`}>{item.icon}</span>}
                                <span>{item.label}</span>
                            </a>
                        )}

                        {/* Hiển thị Separator (trừ mục cuối) */}
                        {!isLast && (
                            separator === '/' ? (
                                <span className={styles.separator}>/</span>
                            ) : (
                                <span className={`material-symbols-outlined ${styles.separator}`}>{separator}</span>
                            )
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}