import React from 'react';
import styles from './StatusBadge.module.css';

export type RoomStatus = 'Available' | 'Pending' | 'Rented' | 'Rejected';

interface StatusBadgeProps {
    status: RoomStatus;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function StatusBadge({ status, size = 'sm', showLabel = true }: StatusBadgeProps) {
    const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];

    if (status === 'Available') {
        return (
            <span className={`${styles.badgeBase} ${sizeClass} ${styles.statusAvailable}`}>
                <span className={styles.dotAvailableWrapper}>
                    <span className={styles.dotAvailablePing}></span>
                    <span className={styles.dotAvailableCore}></span>
                </span>
                {showLabel && <span>Đang cho thuê</span>}
            </span>
        );
    }

    if (status === 'Pending') {
        return (
            <span className={`${styles.badgeBase} ${sizeClass} ${styles.statusPending}`}>
                <span className={styles.dotPendingWrapper}>
                    <span className={styles.dotPendingPing}></span>
                    <span className={styles.dotPendingCore}></span>
                </span>
                {showLabel && <span>Chờ duyệt</span>}
            </span>
        );
    }

    if (status === 'Rejected') {
        return (
            <span className={`${styles.badgeBase} ${sizeClass} ${styles.statusRejected}`}>
                <span className={styles.iconRejected}>cancel</span>
                {showLabel && <span>Bị từ chối</span>}
            </span>
        );
    }

    return (
        <span className={`${styles.badgeBase} ${sizeClass} ${styles.statusRented}`}>
            <span className={styles.dotRented}></span>
            {showLabel && <span>Đã cho thuê</span>}
        </span>
    );
}