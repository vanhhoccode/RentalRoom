import styles from './StatusBadge.module.css';

type StatusType = 'available' | 'rented' | 'pending' | 'expired';

interface StatusBadgeProps {
  status?: StatusType;
  text?: string;
  timeAgo?: string;
}

/**
 * StatusBadge Component cho TroTot.vn
 */
export default function StatusBadge({
  status = 'available',
  text,
  timeAgo
}: StatusBadgeProps) {
  switch (status) {
    case 'available':
      return (
        <div className={`${styles.badgeBase} ${styles.badgeAvailable}`}>
          <span className={styles.pingDotWrapper}>
            <span className={styles.pingDot}></span>
            <span className={styles.staticDotAvailable}></span>
          </span>
          <span className={styles.textAvailable}>
            {text || (timeAgo ? `Còn trống (${timeAgo})` : 'Còn trống')}
          </span>
        </div>
      );

    case 'rented':
      return (
        <div className={`${styles.badgeBase} ${styles.badgeRented}`}>
          <span className={styles.staticDotRented}></span>
          <span className={styles.textRented}>
            {text || 'Đã cho thuê'}
          </span>
        </div>
      );

    case 'pending':
      return (
        <div className={`${styles.badgeBase} ${styles.badgePending}`}>
          <span className={`material-symbols-outlined ${styles.badgeIcon}`}>hourglass_top</span>
          <span className={styles.textPending}>
            {text || 'Chờ duyệt'}
          </span>
        </div>
      );

    case 'expired':
      return (
        <div className={`${styles.badgeBase} ${styles.badgeExpired}`}>
          <span className={`material-symbols-outlined ${styles.badgeIcon}`}>pause_circle</span>
          <span className={styles.textExpired}>
            {text || 'Tạm ẩn / Hết hạn'}
          </span>
        </div>
      );

    default:
      return null;
  }
}