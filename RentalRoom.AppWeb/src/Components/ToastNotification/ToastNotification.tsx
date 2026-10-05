import { useEffect } from 'react';
import styles from './ToastNotification.module.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
  icon: string;
  iconStyle: string;
  bgContainer: string;
}

interface ToastNotificationProps {
  isOpen?: boolean;
  type?: ToastType;
  title?: string;
  message?: string;
  onClose?: () => void;
}

/**
 * ToastNotification Component cho TroTot.vn
 */
export default function ToastNotification({
  isOpen = false,
  type = 'success',
  title = 'Thành công!',
  message = 'Thao tác đã được thực hiện thành công.',
  onClose
}: ToastNotificationProps) {
  // Tự động đóng toast sau 3.2 giây
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Cấu hình class CSS Modules theo loại type
  const config: Record<ToastType, ToastConfig> = {
    success: {
      icon: 'check_circle',
      iconStyle: styles.iconSuccess,
      bgContainer: styles.typeSuccess
    },
    error: {
      icon: 'error',
      iconStyle: styles.iconError,
      bgContainer: styles.typeError
    },
    info: {
      icon: 'notifications',
      iconStyle: styles.iconInfo,
      bgContainer: styles.typeInfo
    }
  };

  const currentConfig = config[type] ?? config.success;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <div className={styles.toastWrapper}>
        <div className={`${styles.toastContainer} ${currentConfig.bgContainer}`}>
          
          <span 
            className={`material-symbols-outlined ${styles.toastIcon} ${currentConfig.iconStyle}`} 
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {currentConfig.icon}
          </span>

          <div className={styles.contentCol}>
            <span className={styles.toastTitle}>
              {title}
            </span>
            <span className={styles.toastMessage}>
              {message}
            </span>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            title="Đóng"
          >
            <span className={`material-symbols-outlined ${styles.closeIcon}`}>close</span>
          </button>

        </div>
      </div>
    </>
  );
}