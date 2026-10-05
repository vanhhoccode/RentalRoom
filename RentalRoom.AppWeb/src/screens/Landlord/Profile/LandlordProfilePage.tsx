import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandlordSidebar from '../../../Components/LandLordSidebar/LandlordSidebar';
import { getMe, MeResponse } from '../../../Services/userService';
import { clearAuth } from '../../../Services/authService';

export default function LandlordProfilePage() {
    const navigate = useNavigate();
    const [me, setMe] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMe()
            .then(setMe)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            clearAuth();
            navigate('/login');
        }
    };

    const displayName = me?.fullName || me?.username || 'Chủ trọ';
    const initial = displayName.charAt(0).toUpperCase();
    const roleLabel = me?.role === 'LANDLORD' ? 'Chủ trọ' : me?.role === 'ADMIN' ? 'Quản trị viên' : (me?.role || '');

    return (
        <div className="bg-[#f8f9ff] font-['Be_Vietnam_Pro'] text-[#0b1c30] min-h-screen flex">
            <LandlordSidebar />

            <div className="pl-64 flex flex-col min-h-screen w-full">
                <main className="flex-1 p-6 lg:p-10 max-w-3xl w-full mx-auto">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-[13px] text-[#6d7a77] mb-6">
                        <span className="cursor-pointer hover:text-[#00685f]" onClick={() => navigate('/landlord/dashboard')}>Tổng quan</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-[#0b1c30] font-semibold">Tài khoản cá nhân</span>
                    </div>

                    {/* Skeleton */}
                    {loading && (
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#eaf1ff] animate-pulse flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-[#eaf1ff]" />
                            <div className="h-6 w-40 bg-[#eaf1ff] rounded-lg" />
                            <div className="h-4 w-28 bg-[#eaf1ff] rounded-lg" />
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="bg-[#ffdad6] text-[#93000a] rounded-xl p-4 flex items-center gap-2 text-[14px]">
                            <span className="material-symbols-outlined">error</span> {error}
                        </div>
                    )}

                    {/* Profile Card */}
                    {!loading && me && (
                        <div className="flex flex-col gap-6">

                            {/* Avatar + tên */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#eaf1ff] flex flex-col items-center gap-4 text-center">
                                {/* Avatar chữ cái */}
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00685f] to-[#006398] flex items-center justify-center text-white text-[40px] font-bold shadow-lg select-none">
                                        {initial}
                                    </div>
                                    <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00685f] border-2 border-white flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[10px] text-white">check</span>
                                    </span>
                                </div>

                                <div>
                                    <h1 className="text-[24px] font-bold text-[#0b1c30]">{displayName}</h1>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eff4ff] text-[#006398] text-[13px] font-semibold">
                                            <span className="material-symbols-outlined text-[14px]">verified</span>
                                            {roleLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin tài khoản */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#eaf1ff] overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#eaf1ff] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#00685f] text-[20px]">manage_accounts</span>
                                    <h2 className="font-bold text-[16px] text-[#0b1c30]">Thông tin tài khoản</h2>
                                </div>

                                <div className="divide-y divide-[#eaf1ff]">
                                    <InfoRow icon="badge" label="Họ và tên" value={me.fullName || '(Chưa cập nhật)'} />
                                    <InfoRow icon="alternate_email" label="Tên đăng nhập" value={me.username} />
                                    <InfoRow icon="fingerprint" label="Mã người dùng" value={`#${me.userId}`} />
                                    <InfoRow icon="shield_person" label="Vai trò" value={roleLabel} />
                                </div>
                            </div>

                            {/* Bảo mật */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#eaf1ff] overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#eaf1ff] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#00685f] text-[20px]">lock</span>
                                    <h2 className="font-bold text-[16px] text-[#0b1c30]">Bảo mật</h2>
                                </div>
                                <div className="p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-xl border border-[#eaf1ff]">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[#6d7a77] text-[20px]">password</span>
                                            <div>
                                                <p className="font-semibold text-[14px] text-[#0b1c30]">Mật khẩu</p>
                                                <p className="text-[12px] text-[#6d7a77]">••••••••</p>
                                            </div>
                                        </div>
                                        <span className="text-[13px] text-[#6d7a77] italic">Liên hệ admin để đổi</span>
                                    </div>
                                </div>
                            </div>

                            {/* Nút đăng xuất */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#ffdad6] overflow-hidden">
                                <div className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-[15px] text-[#0b1c30]">Đăng xuất khỏi hệ thống</p>
                                        <p className="text-[13px] text-[#6d7a77] mt-0.5">Xóa phiên đăng nhập hiện tại trên thiết bị này.</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white text-[#93000a] font-semibold rounded-xl text-[14px] transition-colors active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#6d7a77] text-[18px]">{icon}</span>
                <span className="text-[14px] text-[#6d7a77]">{label}</span>
            </div>
            <span className="text-[14px] font-semibold text-[#0b1c30] text-right">{value}</span>
        </div>
    );
}
