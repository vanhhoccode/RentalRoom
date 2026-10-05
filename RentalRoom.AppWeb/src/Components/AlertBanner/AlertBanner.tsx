import React from 'react';
import styles from './AlertBanner.module.css';

type AlertVariant = 'info' | 'warning' | 'success' | 'gradient';

interface AlertBannerProps {
  variant?: AlertVariant;
  icon?: string;
  title?: string;
  message?: React.ReactNode;
  actionText?: string;
  onActionClick?: () => void;
  onClose?: () => void;
}

/**
 * AlertBanner / InfoBanner Component cho TroTot.vn
 */
export default function AlertBanner({
  variant = 'info',
  icon = 'lightbulb',
  title,
  message,
  actionText,
  onActionClick,
  onClose
}: AlertBannerProps) {
  // Map biến thể sang các class CSS Modules tương ứng
  const variantStyles: Record<AlertVariant, string> = {
    info: styles.infoVariant,
    warning: styles.warningVariant,
    success: styles.successVariant,
    gradient: styles.gradientVariant
  };

  const iconContainerStyles: Record<AlertVariant, string> = {
    info: styles.iconBoxInfo,
    warning: styles.iconBoxWarning,
    success: styles.iconBoxSuccess,
    gradient: styles.iconBoxGradient
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <div className={`${styles.bannerContainer} ${variantStyles[variant] || styles.infoVariant}`}>
        
        {/* Left Section: Icon & Content */}
        <div className={styles.contentWrapper}>
          {icon && (
            <div className={`${styles.iconWrapper} ${iconContainerStyles[variant] || styles.iconBoxInfo}`}>
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            {title && (
              <h4 className={styles.titleText}>
                {title}
              </h4>
            )}
            <div className={styles.messageText}>
              {message}
            </div>
          </div>
        </div>

        {/* Right Section: Action Button & Close */}
        <div className={styles.actionWrapper}>
          {actionText && (
            <button 
              type="button"
              onClick={onActionClick}
              className={styles.actionBtn}
            >
              <span>{actionText}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}

          {onClose && (
            <button 
              type="button"
              onClick={onClose}
              className={styles.closeBtn}
              title="Đóng thông báo"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

      </div>
    </>
  );
}