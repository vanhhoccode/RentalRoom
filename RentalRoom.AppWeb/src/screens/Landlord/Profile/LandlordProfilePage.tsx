import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandlordSidebar from '../../../Components/LandLordSidebar/LandlordSidebar';
import { getMe, MeResponse } from '../../../Services/userService';
import { clearAuth } from '../../../Services/authService';

const BASE_URL = 'https://localhost:7188';

export default function LandlordProfilePage() {
    const navigate = useNavigate();
    const [me, setMe] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tab control
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    // Phone Update State
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [phoneSaving, setPhoneSaving] = useState(false);

    // Password Update State
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdSaving, setPwdSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = () => {
        setLoading(true);
        getMe()
            .then(data => {
                setMe(data);
                setNewPhone(data.phone || '');
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
            clearAuth();
            navigate('/login');
        }
    };

    const getToken = () => localStorage.getItem('accessToken') || '';

    // === CẬP NHẬT SỐ ĐIỆN THOẠI ===
    const handleUpdatePhone = async () => {
        setPhoneError('');
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(newPhone)) {
            setPhoneError('Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.');
            return;
        }

        if (newPhone === me?.phone) {
            setIsEditingPhone(false);
            return;
        }

        try {
            setPhoneSaving(true);
            const response = await fetch(`${BASE_URL}/api/auth/me/phone`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ phone: newPhone })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Cập nhật số điện thoại thất bại.');
            }

            // Cập nhật state nội bộ để UI đổi ngay lập tức
            setMe(prev => prev ? { ...prev, phone: newPhone } : prev);
            setIsEditingPhone(false);
            alert('Cập nhật số điện thoại thành công!');
        } catch (err: any) {
            setPhoneError(err.message);
        } finally {
            setPhoneSaving(false);
        }
    };

    // === ĐỔI MẬT KHẨU ===
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdError('');
        setPwdSuccess('');

        if (!pwdData.currentPassword || !pwdData.newPassword || !pwdData.confirmNewPassword) {
            setPwdError('Vui lòng điền đầy đủ các trường.');
            return;
        }
        if (pwdData.newPassword.length < 6) {
            setPwdError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        if (pwdData.newPassword !== pwdData.confirmNewPassword) {
            setPwdError('Xác nhận mật khẩu không khớp.');
            return;
        }
        if (pwdData.currentPassword === pwdData.newPassword) {
            setPwdError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
            return;
        }

        try {
            setPwdSaving(true);
            const response = await fetch(`${BASE_URL}/api/auth/me/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(pwdData)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.');
            }

            setPwdSuccess('Đổi mật khẩu thành công!');
            setPwdData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err: any) {
            setPwdError(err.message);
        } finally {
            setPwdSaving(false);
        }
    };

    const displayName = me?.fullName || me?.username || 'Chủ trọ';
    const initial = displayName.charAt(0).toUpperCase();
    const roleLabel = me?.role === 'LANDLORD' ? 'Chủ trọ' : me?.role === 'ADMIN' ? 'Quản trị viên' : (me?.role || '');

    return (
        <div className="bg-[#f8f9ff] font-['Be_Vietnam_Pro'] text-[#0b1c30] min-h-screen flex">
            <LandlordSidebar />

            <div className="pl-64 flex flex-col min-h-screen w-full">
                <main className="flex-1 p-6 lg:p-10 max-w-4xl w-full mx-auto">

                    {/* Breadcrumb */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-[13px] text-[#6d7a77]">
                            <span className="cursor-pointer hover:text-[#00685f]" onClick={() => navigate('/landlord/dashboard')}>Tổng quan</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                            <span className="text-[#0b1c30] font-semibold">Tài khoản cá nhân</span>
                        </div>
                    </div>

                    {/* Skeleton Loading */}
                    {loading && (
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#eaf1ff] animate-pulse flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-[#eaf1ff]" />
                            <div className="h-6 w-40 bg-[#eaf1ff] rounded-lg" />
                            <div className="h-4 w-28 bg-[#eaf1ff] rounded-lg" />
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="bg-[#ffdad6] text-[#93000a] rounded-xl p-4 flex items-center gap-2 text-[14px] font-medium mb-6">
                            <span className="material-symbols-outlined">error</span> {error}
                        </div>
                    )}

                    {!loading && me && (
                        <div className="flex flex-col gap-6">

                            {/* Header Profile Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaf1ff] flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00685f] to-[#008378]"></div>

                                <div className="relative shrink-0">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00685f] to-[#006398] flex items-center justify-center text-white text-[36px] font-bold shadow-md select-none border-4 border-white">
                                        {initial}
                                    </div>
                                    <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#10b981] border-2 border-white flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-[12px] text-white">check</span>
                                    </span>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-[24px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">{displayName}</h1>
                                    <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff4ff] text-[#006398] text-[12px] font-bold tracking-wide uppercase">
                                            <span className="material-symbols-outlined text-[16px]">shield_person</span>
                                            {roleLabel}
                                        </span>
                                        <span className="text-[#6d7a77] text-[13px]">ID Hệ thống: #{me.userId}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="md:ml-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#ffdad6] hover:bg-[#ffdad6] hover:text-[#93000a] text-[#ba1a1a] font-bold rounded-xl text-[14px] transition-colors active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    Đăng xuất
                                </button>
                            </div>

                            {/* Custom Tabs */}
                            <div className="flex items-center gap-2 border-b border-[#eaf1ff] px-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`px-4 py-3 font-semibold text-[14px] transition-all border-b-2 ${activeTab === 'profile' ? 'border-[#00685f] text-[#00685f]' : 'border-transparent text-[#6d7a77] hover:text-[#0b1c30]'}`}
                                >
                                    Hồ sơ cá nhân
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`px-4 py-3 font-semibold text-[14px] transition-all border-b-2 ${activeTab === 'security' ? 'border-[#00685f] text-[#00685f]' : 'border-transparent text-[#6d7a77] hover:text-[#0b1c30]'}`}
                                >
                                    Bảo mật & Cài đặt
                                </button>
                            </div>

                            {/* TAB 1: PROFILE */}
                            {activeTab === 'profile' && (
                                <div className="bg-white rounded-2xl shadow-sm border border-[#eaf1ff] overflow-hidden animate-fade-in">
                                    <div className="px-6 py-4 border-b border-[#eaf1ff] flex items-center gap-2 bg-[#f8f9ff]">
                                        <span className="material-symbols-outlined text-[#00685f] text-[20px]">manage_accounts</span>
                                        <h2 className="font-bold text-[16px] text-[#0b1c30]">Thông tin chi tiết</h2>
                                    </div>

                                    <div className="divide-y divide-[#eaf1ff]">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-6 py-5 hover:bg-[#f8f9ff] transition-colors">
                                            <div className="text-[14px] text-[#6d7a77] font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">badge</span> Họ và tên
                                            </div>
                                            <div className="md:col-span-2 text-[14px] font-bold text-[#0b1c30]">
                                                {me.fullName || '(Chưa cập nhật)'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-6 py-5 hover:bg-[#f8f9ff] transition-colors">
                                            <div className="text-[14px] text-[#6d7a77] font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">alternate_email</span> Tên đăng nhập
                                            </div>
                                            <div className="md:col-span-2 text-[14px] font-bold text-[#0b1c30]">
                                                {me.username}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-6 py-5 hover:bg-[#f8f9ff] transition-colors">
                                            <div className="text-[14px] text-[#6d7a77] font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">mail</span> Email
                                            </div>
                                            <div className="md:col-span-2 text-[14px] font-bold text-[#0b1c30]">
                                                {me.email || '(Chưa cập nhật)'}
                                            </div>
                                        </div>

                                        {/* SỐ ĐIỆN THOẠI CÓ THỂ SỬA */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-6 py-5 bg-[#f8f9ff]">
                                            <div className="text-[14px] text-[#6d7a77] font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">call</span> Số điện thoại
                                            </div>
                                            <div className="md:col-span-2">
                                                {!isEditingPhone ? (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[14px] font-bold text-[#0b1c30]">
                                                            {me.phone || '(Chưa cập nhật)'}
                                                        </span>
                                                        <button onClick={() => setIsEditingPhone(true)} className="text-[13px] font-semibold text-[#00685f] hover:underline flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px]">edit</span> Sửa
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={newPhone}
                                                                onChange={(e) => {
                                                                    setNewPhone(e.target.value.replace(/\D/g, ''));
                                                                    setPhoneError('');
                                                                }}
                                                                maxLength={10}
                                                                placeholder="Nhập số điện thoại (10 số)"
                                                                className="flex-1 px-3 py-2 border border-[#outline-variant] rounded-lg text-[14px] outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]"
                                                            />
                                                            <button
                                                                onClick={handleUpdatePhone}
                                                                disabled={phoneSaving}
                                                                className="px-4 py-2 bg-[#00685f] text-white rounded-lg text-[13px] font-bold hover:bg-[#008378] transition-colors disabled:opacity-50 whitespace-nowrap"
                                                            >
                                                                {phoneSaving ? 'Đang lưu...' : 'Lưu'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setIsEditingPhone(false);
                                                                    setNewPhone(me.phone || '');
                                                                    setPhoneError('');
                                                                }}
                                                                disabled={phoneSaving}
                                                                className="px-4 py-2 bg-white border border-[#eaf1ff] text-[#6d7a77] rounded-lg text-[13px] font-bold hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 whitespace-nowrap"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                        {phoneError && <span className="text-[12px] text-[#ba1a1a] font-medium">{phoneError}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: SECURITY */}
                            {activeTab === 'security' && (
                                <div className="bg-white rounded-2xl shadow-sm border border-[#eaf1ff] overflow-hidden animate-fade-in flex flex-col md:flex-row">

                                    {/* Left Content */}
                                    <div className="flex-1 p-6 md:p-8">
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="material-symbols-outlined text-[#00685f] text-[24px]">lock_reset</span>
                                            <h2 className="font-bold text-[18px] text-[#0b1c30]">Đổi mật khẩu</h2>
                                        </div>

                                        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                                            {pwdError && (
                                                <div className="bg-[#ffdad6] text-[#93000a] text-[13px] p-3 rounded-lg border border-[#93000a]/20">
                                                    {pwdError}
                                                </div>
                                            )}
                                            {pwdSuccess && (
                                                <div className="bg-[#dcfce7] text-[#065f46] text-[13px] p-3 rounded-lg border border-[#16a34a]/20">
                                                    {pwdSuccess}
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[13px] font-semibold text-[#0b1c30]">Mật khẩu hiện tại</label>
                                                <input
                                                    type="password"
                                                    value={pwdData.currentPassword}
                                                    onChange={e => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-[#eaf1ff] bg-[#f8f9ff] rounded-xl text-[14px] outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f] transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[13px] font-semibold text-[#0b1c30]">Mật khẩu mới</label>
                                                    <input
                                                        type="password"
                                                        value={pwdData.newPassword}
                                                        onChange={e => setPwdData({ ...pwdData, newPassword: e.target.value })}
                                                        className="w-full px-4 py-2.5 border border-[#eaf1ff] bg-[#f8f9ff] rounded-xl text-[14px] outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f] transition-all"
                                                        placeholder="Tối thiểu 6 ký tự"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[13px] font-semibold text-[#0b1c30]">Xác nhận mật khẩu mới</label>
                                                    <input
                                                        type="password"
                                                        value={pwdData.confirmNewPassword}
                                                        onChange={e => setPwdData({ ...pwdData, confirmNewPassword: e.target.value })}
                                                        className="w-full px-4 py-2.5 border border-[#eaf1ff] bg-[#f8f9ff] rounded-xl text-[14px] outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f] transition-all"
                                                        placeholder="Nhập lại mật khẩu mới"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <button
                                                    type="submit"
                                                    disabled={pwdSaving}
                                                    className="px-6 py-3 bg-[#0b1c30] text-white rounded-xl text-[14px] font-bold hover:bg-[#213145] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                                >
                                                    {pwdSaving ? (
                                                        <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Đang lưu...</>
                                                    ) : (
                                                        'Cập nhật mật khẩu'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Right Content - Tips */}
                                    <div className="md:w-1/3 bg-[#f8f9ff] p-6 md:p-8 border-t md:border-t-0 md:border-l border-[#eaf1ff] flex flex-col justify-center gap-4">
                                        <div className="w-12 h-12 bg-[#dce9ff] text-[#006398] rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[24px]">security</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[15px] text-[#0b1c30]">Khuyến nghị bảo mật</h3>
                                            <ul className="mt-3 flex flex-col gap-2 text-[13px] text-[#6d7a77] list-disc pl-4">
                                                <li>Nên đổi mật khẩu định kỳ 6 tháng/lần.</li>
                                                <li>Mật khẩu nên chứa cả chữ hoa, chữ thường và số.</li>
                                                <li>Tuyệt đối không chia sẻ mật khẩu cho người khác.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}