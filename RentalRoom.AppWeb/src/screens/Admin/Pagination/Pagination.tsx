import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage = 5, onPageChange }: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage;

    const generatePages = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pages.push('...');
            }
        }
        return pages.filter((val, idx, arr) => val !== '...' || arr[idx - 1] !== '...');
    };

    return (
        <div className={styles.paginationWrapper}>
            <div className={styles.infoText}>
                Hiển thị <strong>{startItem} - {endItem}</strong> {totalItems && <span>trên tổng số <strong>{totalItems}</strong></span>}
            </div>
            <div className={styles.controls}>
                <button
                    className={`${styles.pageBtn} ${styles.btnInactive}`}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                </button>

                {generatePages().map((page, idx) => (
                    page === '...' ? (
                        <span key={`dot-${idx}`} className={styles.dots}>...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`${styles.pageBtn} ${currentPage === page ? styles.btnActive : styles.btnInactive}`}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    className={`${styles.pageBtn} ${styles.btnInactive}`}
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                </button>
            </div>
        </div>
    );
}