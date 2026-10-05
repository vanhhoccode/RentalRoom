import styles from './Footer.module.css';

/**
 * Footer Component cho TroTot.vn
 */
export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <footer className={styles.footerContainer}>
        <div className={styles.footerWrapper}>
          
          {/* Cột 1 & 2: Thông tin thương hiệu */}
          <div className={styles.brandCol}>
            <div className={styles.brandLogoArea}>
              <div className={styles.logoIconWrapper}>
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  home_work
                </span>
              </div>
              <span className={styles.brandTitle}>TroTot.vn</span>
            </div>
            <p className={styles.brandDesc}>
              Nền tảng kết nối chủ nhà và người tìm phòng trọ minh bạch, uy tín hàng đầu Việt Nam. Cập nhật thông tin phòng trống theo thời gian thực (Real-time).
            </p>
            <div className={styles.socialIconsGroup}>
              <a href="#facebook" className={styles.socialBtn} title="Facebook">
                <span className="material-symbols-outlined text-[18px]">public</span>
              </a>
              <a href="#youtube" className={styles.socialBtn} title="Youtube">
                <span className="material-symbols-outlined text-[18px]">smart_display</span>
              </a>
              <a href="#zalo" className={styles.socialBtn} title="Zalo">
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </a>
            </div>
          </div>

          {/* Cột 3: Khám phá */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnHeading}>Khám phá</h4>
            <ul className={styles.footerLinksList}>
              <li><a href="#hanoi" className={styles.footerLink}>Phòng trọ Hà Nội</a></li>
              <li><a href="#hcm" className={styles.footerLink}>Phòng trọ TP.HCM</a></li>
              <li><a href="#danang" className={styles.footerLink}>Phòng trọ Đà Nẵng</a></li>
              <li><a href="#mini" className={styles.footerLink}>Chung cư mini giá rẻ</a></li>
              <li><a href="#dorm" className={styles.footerLink}>Ở ghép / KTX tiện nghi</a></li>
            </ul>
          </div>

          {/* Cột 4: Hỗ trợ khách hàng */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnHeading}>Hỗ trợ</h4>
            <ul className={styles.footerLinksList}>
              <li><a href="#guide" className={styles.footerLink}>Hướng dẫn đăng tin</a></li>
              <li><a href="#safety" className={styles.footerLink}>Quy chế kiểm duyệt</a></li>
              <li><a href="#faq" className={styles.footerLink}>Câu hỏi thường gặp</a></li>
              <li><a href="#policy" className={styles.footerLink}>Chính sách bảo mật</a></li>
              <li><a href="#terms" className={styles.footerLink}>Điều khoản dịch vụ</a></li>
            </ul>
          </div>

          {/* Cột 5: Liên hệ */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnHeading}>Liên hệ</h4>
            <div className={styles.footerLinksList}>
              <div className={styles.contactInfoItem}>
                <span className={`material-symbols-outlined ${styles.contactIcon}`}>location_on</span>
                <span>Đại học Bách Khoa Hà Nội, Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
              </div>
              <div className={styles.contactInfoItem}>
                <span className={`material-symbols-outlined ${styles.contactIcon}`}>call</span>
                <span>Hotline: 1900 6868</span>
              </div>
              <div className={styles.contactInfoItem}>
                <span className={`material-symbols-outlined ${styles.contactIcon}`}>mail</span>
                <span>Email: support@trotot.vn</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dòng Copyright cuối cùng */}
        <div className={styles.bottomBar}>
          <p>© 2026 TroTot.vn. Bảo lưu mọi quyền.</p>
          <div className={styles.bottomLinks}>
            <a href="#privacy" className={styles.footerLink}>Chính sách riêng tư</a>
            <a href="#terms" className={styles.footerLink}>Điều khoản sử dụng</a>
          </div>
        </div>
      </footer>
    </>
  );
}