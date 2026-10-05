import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import InputField from '../../Components/Input/InputField';
import Button from '../../Components/Button/Button';
import ToastNotification from '../../Components/ToastNotification/ToastNotification';
import { register, login, saveAuthToStorage } from '../../Services/authService';
import type { RegisterRequestDto, LoginRequestDto } from '../../Dtos/Auth/AuthDto';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('register');

  const [registerForm, setRegisterForm] = useState<RegisterRequestDto>({
    username: '',
    email: '',
    password: '',
    roleId: 1,
    phone: '',
    fullName: '',
  });

  const [loginForm, setLoginForm] = useState<LoginRequestDto>({
    usernameOrEmail: '',
    password: '',
  });

  const [toast, setToast] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'info',
    title: '',
    message: '',
  });

  const showToast = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
  ) => setToast({ isOpen: true, type, title, message });

  const handleRegisterChange = (field: keyof RegisterRequestDto, value: string | number) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
  };

  // ====== XỬ LÝ ĐĂNG KÝ ======
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(registerForm);
      showToast('success', 'Đăng ký thành công! 🎉', 'Tài khoản của bạn đã được lưu vào Database.');
      setTimeout(() => setActiveTab('login'), 1500);
    } catch (error) {
      showToast(
        'error',
        'Lỗi đăng ký',
        error instanceof Error ? error.message : 'Không thể lưu dữ liệu xuống hệ thống.',
      );
    }
  };

  // ====== XỬ LÝ ĐĂNG NHẬP ======
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await login(loginForm);

      if (data.token) {
        saveAuthToStorage(data);
        showToast('success', 'Đăng nhập thành công!', 'Đang chuyển hướng...');
        setTimeout(() => {
          navigate(data.roleCode === 'LANDLORD' ? '/create-room' : '/');
        }, 1500);
      }
    } catch (error) {
      showToast(
        'error',
        'Đăng nhập thất bại',
        error instanceof Error ? error.message : 'Đăng nhập thất bại.',
      );
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.mainSection}>
        <div className={styles.contentWrapper}>

          <div className={styles.blobLeft}></div>
          <div className={styles.blobRight}></div>

          <div className={styles.gridContainer}>

            {/* CỘT TRÁI: GIỚI THIỆU HỆ THỐNG */}
            <section className={styles.leftColumn}>
              <div className={styles.leftGradientBg}></div>

              <div className="relative z-10 flex flex-col gap-6">
                <div className={styles.badgeVerified}>
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span className="text-xs font-semibold tracking-wide uppercase">Hệ Thống Xác Thực Độc Quyền</span>
                </div>

                <h1 className={styles.heroTitle}>
                  Tìm phòng nhanh, <span className={styles.heroHighlight}>chuẩn thực tế</span> & an tâm tuyệt đối
                </h1>
                <p className={styles.heroDesc}>
                  Khám phá giải pháp kết nối thuê trọ số 1 Việt Nam với công nghệ cập nhật tình trạng phòng theo thời gian thực (Real-time).
                </p>

                <ul className={styles.featureList}>
                  <li className={styles.featureItem}>
                    <div className={styles.featureIconGreen}>
                      <span className="material-symbols-outlined text-[20px]">badge</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#0b1c30]">Xác minh CCCD & Sổ đỏ chính chủ</span>
                      <span className="text-xs text-[#3d4947]">100% chủ nhà được kiểm duyệt pháp lý nghiêm ngặt.</span>
                    </div>
                  </li>
                  <li className={styles.featureItem}>
                    <div className={styles.featureIconTeal}>
                      <span className="material-symbols-outlined text-[20px]">sync_saved_locally</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#0b1c30]">Không sợ phòng ảo hay hết phòng</span>
                      <span className="text-xs text-[#3d4947]">Trạng thái phòng chuyển ngay khi chủ nhà ký gửi thành công.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className={styles.bannerCard}>
                <div
                  className={styles.bannerImageBg}
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAdv6IXUz1RBfbw-rjv8AY3F2oePROyNNoK3ewT-U-5TnP9SWWOeWy4E0mBZ6GqhcBMOuH-AaZ-vygOuPYDaPEmWy6Ooxh4pkKIUvHA9xyLM1YXm8-7au71L8qLJhfFhZLBSBqcgM_LmHfob3kqT7Ww52vKLGJsgFbDZVLYR4H2Yh3euQ5qpO3EGE7ZOQf6bSYs3jS6zUTZ1zXgVezznFA8Hi8kLlF4ftEA_7M5LJbIe71A1-L2cim2')` }}
                >
                  <div className={styles.bannerOverlay}>
                    <div className="flex items-center justify-between w-full text-white text-xs">
                      <span>+85.000 người đã tìm được trọ ưng ý</span>
                      <span className="text-[#89f5e7] font-bold flex items-center gap-1">⭐ 4.9/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CỘT PHẢI: FORM ĐĂNG KÝ / ĐĂNG NHẬP */}
            <section className={styles.rightColumn}>

              {/* Tab Switcher */}
              <div className={styles.tabSwitcher}>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`${styles.tabButton} ${activeTab === 'register' ? styles.tabActive : styles.tabInactive}`}
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>Đăng ký thành viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`${styles.tabButton} ${activeTab === 'login' ? styles.tabActive : styles.tabInactive}`}
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Đăng nhập</span>
                </button>
              </div>

              {/* TAB ĐĂNG KÝ */}
              {activeTab === 'register' && (
                <div className="flex flex-col gap-6">
                  <div className={styles.roleSelectionContainer}>
                    <span className="text-sm font-bold text-[#0b1c30]">1. Chọn vai trò của bạn</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => handleRegisterChange('roleId', 1)}
                        className={`${styles.roleCard} ${registerForm.roleId === 1 ? styles.roleCardRenterActive : styles.roleCardInactive}`}
                      >
                        <div className="font-bold text-sm text-[#0b1c30]">Tôi là Người thuê phòng</div>
                        <p className="text-xs text-[#3d4947] mt-1">Tìm phòng nhanh, lưu tin yêu thích, xem phòng thực tế.</p>
                      </div>
                      <div
                        onClick={() => handleRegisterChange('roleId', 2)}
                        className={`${styles.roleCard} ${registerForm.roleId === 2 ? styles.roleCardLandlordActive : styles.roleCardInactive}`}
                      >
                        <div className="font-bold text-sm text-[#0b1c30]">Tôi là Chủ trọ / Quản lý</div>
                        <p className="text-xs text-[#3d4947] mt-1">Đăng tin dễ dàng, bật/tắt trạng thái phòng trống realtime.</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className={styles.formContainer}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InputField
                        label="Tên đăng nhập (Username)"
                        placeholder="Ví dụ: tenant2"
                        required
                        icon="account_circle"
                        value={registerForm.username}
                        onChange={(e) => handleRegisterChange('username', e.target.value)}
                      />
                      <InputField
                        label="Họ và tên hiển thị (FullName)"
                        placeholder="Ví dụ: Người khác"
                        required
                        icon="person"
                        value={registerForm.fullName}
                        onChange={(e) => handleRegisterChange('fullName', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InputField
                        label="Email"
                        placeholder="abc@gmail.com"
                        type="email"
                        required
                        icon="alternate_email"
                        value={registerForm.email}
                        onChange={(e) => handleRegisterChange('email', e.target.value)}
                      />
                      <InputField
                        label="Số điện thoại (Phone)"
                        placeholder="0909000099"
                        type="tel"
                        required
                        icon="phone"
                        value={registerForm.phone}
                        onChange={(e) => handleRegisterChange('phone', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                      <InputField
                        label="Mật khẩu (Password)"
                        placeholder="123456"
                        type="password"
                        required
                        icon="lock"
                        value={registerForm.password}
                        onChange={(e) => handleRegisterChange('password', e.target.value)}
                      />
                    </div>

                    <Button type="submit" variant="primary" size="lg" fullWidth icon="arrow_forward" iconPosition="right">
                      Tạo tài khoản ngay
                    </Button>
                  </form>

                  <div className="text-center pt-2">
                    <p className="text-xs text-[#3d4947]">
                      Bạn đã có tài khoản TroTot.vn?{' '}
                      <button type="button" onClick={() => setActiveTab('login')} className={styles.linkButton}>
                        Đăng nhập ngay
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* TAB ĐĂNG NHẬP */}
              {activeTab === 'login' && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-[#0b1c30]">Chào mừng trở lại! 👋</h2>
                    <p className="text-xs text-[#3d4947]">Đăng nhập để xem danh sách phòng đã lưu và quản lý tin.</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className={styles.formContainer}>
                    <InputField
                      label="Tên đăng nhập hoặc Email"
                      placeholder="tenant2 hoặc abc@gmail.com"
                      required
                      icon="alternate_email"
                      value={loginForm.usernameOrEmail}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, usernameOrEmail: e.target.value }))}
                    />
                    <InputField
                      label="Mật khẩu"
                      placeholder="Nhập mật khẩu của bạn"
                      type="password"
                      required
                      icon="key"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    />
                    <Button type="submit" variant="primary" size="lg" fullWidth icon="login" iconPosition="right">
                      Đăng nhập TroTot
                    </Button>
                  </form>

                  <div className="text-center pt-2">
                    <p className="text-xs text-[#3d4947]">
                      Chưa có tài khoản TroTot.vn?{' '}
                      <button type="button" onClick={() => setActiveTab('register')} className={styles.linkButton}>
                        Đăng ký thành viên mới
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />

      <ToastNotification
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}