import React from 'react';
import styles from './BreadcrumbPageHeader.module.css';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbPageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onNavigate?: (path: string) => void;
}

/**
 * BreadcrumbPageHeader Component cho TroTot.vn
 * 
 * @param breadcrumbs - Mảng các cấp đường dẫn, ví dụ: [{ label: 'Trang chủ', path: 'trang-chu' }, { label: 'Kênh chủ trọ', path: '' }, { label: 'Quản lý tin đăng' }]
 * @param title - Tiêu đề chính của trang
 * @param subtitle - Mô tả phụ đề hoặc thông tin trạng thái bên dưới tiêu đề
 * @param actions - Các nút bấm hành động phụ trợ đặt bên phải (nếu có)
 * @param onNavigate - Hàm xử lý khi click vào các link trên breadcrumb
 */
export default function BreadcrumbPageHeader({
  breadcrumbs = [],
  title,
  subtitle,
  actions,
  onNavigate
}: BreadcrumbPageHeaderProps) {
  const handleLinkClick = (path: string | undefined, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (path && onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <div className={styles.headerContainer}>
        <div className={styles.innerWrapper}>
          
          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className={styles.navBreadcrumb}>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={index}>
                    {index === 0 && (
                      <span className={`material-symbols-outlined ${styles.homeIcon}`}>home</span>
                    )}
                    
                    {!isLast ? (
                      <>
                        <a 
                          href="#" 
                          onClick={(e) => handleLinkClick(item.path, e)}
                          className={styles.breadcrumbLink}
                        >
                          {item.label}
                        </a>
                        <span className={`material-symbols-outlined ${styles.chevronIcon}`}>chevron_right</span>
                      </>
                    ) : (
                      <span className={styles.breadcrumbActive}>{item.label}</span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          {/* Page Header Title & Actions Row */}
          <div className={styles.titleActionsRow}>
            <div className={styles.titleGroup}>
              {title && (
                <h1 className={styles.pageTitle}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className={styles.pageSubtitle}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Action Buttons Slot */}
            {actions && (
              <div className={styles.actionsSlot}>
                {actions}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}