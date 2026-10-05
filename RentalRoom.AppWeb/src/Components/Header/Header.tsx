import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { clearAuth } from '../../Services/authService';

const BASE_URL = 'https://localhost:7188';

interface StoredUser {
  userId?: number;
  username?: string;
  fullName?: string;
  roleCode?: string;
}

interface HeaderProps {
  /** Callback khi user gõ vào search và nhấn Enter / click tìm kiếm */
  onSearch?: (keyword: string) => void;
  /** Giá trị keyword hiện tại để sync với trang chủ */
  searchValue?: string;
}

export default function Header({ onSearch, searchValue = '' }: HeaderProps) {
  const navigate = useNavigate();

  // ── Auth state ──────────────────────────────────────────────
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Search state ─────────────────────────────────────────────
  const [keyword, setKeyword] = useState(searchValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đọc user từ localStorage khi mount
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
    // Lắng nghe thay đổi từ tab khác / sau login
    const onStorage = () => {
      const raw2 = localStorage.getItem('user');
      setUser(raw2 ? JSON.parse(raw2) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync khi prop thay đổi từ ngoài
  useEffect(() => { setKeyword(searchValue); }, [searchValue]);

  // ── Search: lấy gợi ý từ API ────────────────────────────────
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(
        `${BASE_URL}/api/rooms?keyword=${encodeURIComponent(q)}&page=1&pageSize=5`
      );
      if (!res.ok) return;
      const data = await res.json();
      const titles: string[] = (data.rooms ?? []).map((r: any) => r.title).slice(0, 5);
      setSuggestions(titles);
    } catch { /* ignore */ }
  }, []);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const triggerSearch = (kw: string) => {
    setShowSuggestions(false);
    setKeyword(kw);
    if (onSearch) onSearch(kw);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') triggerSearch(keyword);
  };

  // ── Auth actions ─────────────────────────────────────────────
  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  const displayName = user?.fullName || user?.username || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <header className={styles.headerContainer}>
        <div className={styles.headerInner}>

          {/* ── Logo ── */}
          <div className={styles.logoSearchSection}>
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className={styles.logoLink}>
              <img
                alt="TroTot Logo"
                className={styles.logoImg}
                src="https://lh3.googleusercontent.com/aida/AEtjO1VPcTtQxR4QtWjIQHbp7eMd99qNRyWgGLHTMl8oGnnqROKrU2K7Z19N-7dUgp9sjOeI03A008Hus-C0kyHwdMIuQmGHMxpUVJQ35GaWn3n06vqGx3fmcPH6G2Hu-kD3PhevVWhrnP-AwoDtgkUfwIrA3tv5VAuEvj6a8Hid3yBHabfdGkpYnI2CVL0kkVWCIRmo7k9_8hsAZBInwJM8r59vcNCfqb2qzZo1SXWpLZnJk8xRDTQrBk73XRM"
              />
              <span className={styles.logoText}>TroTot<span className={styles.logoTextSub}>.vn</span></span>
            </a>

            {/* ── Search box với gợi ý ── */}
            <div className={styles.searchBox} ref={searchRef} style={{ position: 'relative' }}>
              <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
              <input
                type="text"
                value={keyword}
                onChange={handleKeywordChange}
                onKeyDown={handleKeyDown}
                onFocus={() => keyword.length >= 2 && setShowSuggestions(true)}
                className={styles.searchInput}
                placeholder="Khu vực, trường ĐH..."
              />
              {keyword && (
                <button
                  onClick={() => triggerSearch('')}
                  className="text-[#6d7a77] hover:text-[#0b1c30] transition-colors flex-shrink-0"
                  title="Xóa"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
              <button
                onClick={() => triggerSearch(keyword)}
                className="flex-shrink-0 bg-[#00685f] hover:bg-[#008378] text-white rounded-full px-3 py-1 text-[11px] font-semibold transition-colors"
              >
                Tìm
              </button>

              {/* Dropdown gợi ý */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: '#fff', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                    zIndex: 100, overflow: 'hidden', border: '1px solid #eaf1ff'
                  }}
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => triggerSearch(s)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '10px 14px', textAlign: 'left',
                        fontSize: '13px', color: '#0b1c30', background: 'transparent',
                        borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8f9ff')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6d7a77' }}>search</span>
                      <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Nav ── */}
          <nav className={styles.navMenu}>
            {[
              { path: '/', label: 'Trang chủ' },
              { path: '/favorites', label: 'Đã lưu' },
            ].map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                className={`${styles.navItem} ${styles.navItemInactive}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className={styles.rightActions}>

            {/* Nút đăng tin */}
            <a
              href="/create-room"
              onClick={(e) => { e.preventDefault(); navigate('/create-room'); }}
              className={styles.postButton}
            >
              <span className={`material-symbols-outlined ${styles.postIcon}`}>add_circle</span>
              <span>Đăng tin miễn phí</span>
            </a>

            {/* ── User area ── */}
            {!user ? (
              /* Chưa đăng nhập */
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#00685f] text-[#00685f] hover:bg-[#00685f] hover:text-white text-[13px] font-semibold transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Đăng nhập
              </button>
            ) : (
              /* Đã đăng nhập */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(v => !v)}
                  className={styles.userProfile}
                >
                  {/* Avatar chữ cái */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00685f] to-[#006398] flex items-center justify-center text-white text-[14px] font-bold select-none flex-shrink-0">
                    {initial}
                  </div>
                  <span className={styles.userName}>{displayName}</span>
                  <span className={`material-symbols-outlined ${styles.userExpandIcon}`}>
                    {showDropdown ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                  <div
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      minWidth: '220px', background: '#fff', borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200,
                      border: '1px solid #eaf1ff', overflow: 'hidden'
                    }}
                  >
                    {/* Header dropdown */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #eaf1ff', background: '#f8f9ff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #00685f, #006398)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '16px', fontWeight: 700, flexShrink: 0
                        }}>
                          {initial}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0b1c30', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {displayName}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6d7a77', margin: 0 }}>
                            {user.roleCode === 'LANDLORD' ? 'Chủ trọ' : user.roleCode === 'ADMIN' ? 'Quản trị viên' : 'Người thuê'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    {[
                      ...(user.roleCode === 'LANDLORD' ? [
                        { icon: 'grid_view', label: 'Tổng quan', path: '/landlord/dashboard' },
                        { icon: 'real_estate_agent', label: 'Tin của tôi', path: '/landlord/listings' },
                        { icon: 'account_circle', label: 'Tài khoản', path: '/landlord/profile' },
                      ] : user.roleCode === 'ADMIN' ? [
                        { icon: 'admin_panel_settings', label: 'Quản trị', path: '/admin/dashboard' },
                      ] : [
                        { icon: 'favorite', label: 'Phòng đã lưu', path: '/favorites' },
                      ]),
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setShowDropdown(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                          padding: '11px 16px', fontSize: '14px', color: '#0b1c30',
                          background: 'transparent', borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer', textAlign: 'left', fontWeight: 500,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8f9ff')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#00685f' }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '11px 16px', fontSize: '14px', color: '#93000a',
                        background: 'transparent', cursor: 'pointer', fontWeight: 600,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#ffdad6')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </header>
    </>
  );
}