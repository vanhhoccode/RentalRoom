import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandlordSidebar from '../../../Components/LandLordSidebar/LandlordSidebar';
import { getMyRooms } from '../../../Services/roomService';
import { getMe, MeResponse } from '../../../Services/userService';
import styles from './LandlordDashboardPage.module.css';

const BASE_URL = 'https://localhost:7188';

interface RoomItem {
    id: number;
    title: string;
    price: number;
    area: number;
    district: string;
    ward: string;
    status: string;
    createdAt: string;
    imageUrl?: string;
}

interface KPI {
    total: number;
    pending: number;
    available: number;
    rented: number;
    rejected: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    Available: { label: 'Đang cho thuê', color: '#065f46', bg: '#dcfce7', dot: '#16a34a' },
    Rented: { label: 'Đã cho thuê', color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
    Pending: { label: 'Chờ duyệt', color: '#92400e', bg: '#fef3c7', dot: '#d97706' },
    Rejected: { label: 'Bị từ chối', color: '#93000a', bg: '#ffdad6', dot: '#ba1a1a' },
};

export default function LandlordDashboardPage() {
    const navigate = useNavigate();

    const [me, setMe] = useState<MeResponse | null>(null);
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [kpi, setKpi] = useState<KPI>({ total: 0, pending: 0, available: 0, rented: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [meData, roomsData] = await Promise.all([
                    getMe(),
                    getMyRooms(),
                ]);

                setMe(meData);

                const roomList: RoomItem[] = roomsData;
                setRooms(roomList);

                setKpi({
                    total: roomList.length,
                    pending: roomList.filter((r: RoomItem) => r.status === 'Pending').length,
                    available: roomList.filter((r: RoomItem) => r.status === 'Available').length,
                    rented: roomList.filter((r: RoomItem) => r.status === 'Rented').length,
                    rejected: roomList.filter((r: RoomItem) => r.status === 'Rejected').length,
                });
            } catch (err: any) {
                setError(err.message || 'Lỗi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Lấy tên hiển thị: ưu tiên fullName, fallback về username, rồi localStorage
    const displayName = me?.fullName || me?.username
        || (() => {
            try { return JSON.parse(localStorage.getItem('user') || '{}').fullName; } catch { return null; }
        })()
        || 'Chủ trọ';

    const recentRooms = rooms.slice(0, 5);
    const fillRate = kpi.total > 0 ? ((kpi.rented / kpi.total) * 100).toFixed(0) : '0';

    return (
        <div className={styles.pageWrapper}>
            <LandlordSidebar />

            <div className="pl-64 flex flex-col min-h-screen w-full">
                <main className="w-full flex-1">
                    <div className={styles.mainContainer}>

                        {/* ===== WELCOME CARD ===== */}
                        <section className={styles.welcomeCard}>
                            <div className={styles.welcomeProfile}>
                                <div className={styles.avatarContainer}>
                                    {/* Avatar chữ cái đầu */}
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00685f] to-[#006398] flex items-center justify-center text-white text-[24px] font-bold select-none shadow-md">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={styles.avatarBadge}>
                                        <span className="material-symbols-outlined text-[10px] text-white">check</span>
                                    </span>
                                </div>
                                <div className={styles.welcomeText}>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {loading
                                            ? <div className="h-7 w-48 bg-[#eaf1ff] rounded-lg animate-pulse" />
                                            : <h1 className={styles.welcomeTitle}>Xin chào, {displayName} 👋</h1>
                                        }
                                        <span className={styles.verifiedTag}>
                                            <span className="material-symbols-outlined text-[14px]">verified</span>
                                            Chủ trọ
                                        </span>
                                    </div>
                                    <p className={styles.welcomeDesc}>
                                        {loading
                                            ? 'Đang tải dữ liệu...'
                                            : kpi.available > 0
                                                ? <>Bạn có <strong className="text-[#00685f]">{kpi.available} phòng</strong> đang hiển thị và đón khách thuê.</>
                                                : 'Hiện chưa có phòng nào đang cho thuê. Hãy đăng tin mới!'
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                className="inline-flex items-center gap-2 px-5 py-3 bg-[#00685f] hover:bg-[#008378] active:scale-95 text-white font-semibold rounded-xl shadow transition-all text-[15px]"
                                onClick={() => navigate('/create-room')}
                            >
                                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                Đăng tin mới
                            </button>
                        </section>

                        {/* ===== KPI CARDS ===== */}
                        <section className={styles.kpiGrid}>
                            {[
                                { label: 'Tổng tin đăng', value: kpi.total, icon: 'real_estate_agent', color: '#00685f', bg: '#eff4ff' },
                                { label: 'Chờ duyệt', value: kpi.pending, icon: 'hourglass_top', color: '#b45309', bg: '#fef3c7' },
                                { label: 'Đang cho thuê', value: kpi.available, icon: 'check_circle', color: '#065f46', bg: '#dcfce7' },
                                { label: 'Đã cho thuê', value: kpi.rented, icon: 'key', color: '#006398', bg: '#cce5ff' },
                            ].map(card => (
                                <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#eaf1ff] flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: card.bg }}>
                                        <span className="material-symbols-outlined text-[24px]" style={{ color: card.color }}>{card.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-semibold text-[#6d7a77] uppercase tracking-wide">{card.label}</p>
                                        {loading
                                            ? <div className="h-8 w-12 bg-[#eaf1ff] rounded-lg animate-pulse mt-1" />
                                            : <p className="text-[28px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans'] leading-tight">{card.value}</p>
                                        }
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* ===== MAIN GRID ===== */}
                        <div className={styles.mainGrid}>

                            {/* CỘT TRÁI: Tin đăng gần đây */}
                            <div className={styles.listingsCol}>
                                <div className={styles.sectionHeader}>
                                    <div className="flex items-center gap-2">
                                        <h2 className={styles.sectionTitle}>Tin đăng gần đây</h2>
                                        <span className={styles.countBadge}>{kpi.total} tin</span>
                                    </div>
                                    <span className={styles.viewAllLink} onClick={() => navigate('/landlord/listings')}>
                                        Xem tất cả <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {loading && Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl p-4 border border-[#eaf1ff] flex gap-4 animate-pulse">
                                            <div className="w-20 h-20 rounded-xl bg-[#eaf1ff] flex-shrink-0" />
                                            <div className="flex-1 flex flex-col gap-2 justify-center">
                                                <div className="h-4 bg-[#eaf1ff] rounded w-3/4" />
                                                <div className="h-3 bg-[#eaf1ff] rounded w-1/2" />
                                                <div className="h-5 bg-[#eaf1ff] rounded w-20" />
                                            </div>
                                        </div>
                                    ))}

                                    {!loading && error && (
                                        <div className="bg-[#ffdad6] text-[#93000a] rounded-xl p-4 text-[14px] flex items-center gap-2">
                                            <span className="material-symbols-outlined">error</span> {error}
                                        </div>
                                    )}

                                    {!loading && !error && recentRooms.length === 0 && (
                                        <div className="bg-white rounded-2xl p-8 text-center border border-[#eaf1ff]">
                                            <span className="material-symbols-outlined text-[48px] text-[#bcc9c6]">real_estate_agent</span>
                                            <p className="text-[#6d7a77] mt-2">Bạn chưa có tin đăng nào.</p>
                                            <button
                                                onClick={() => navigate('/create-room')}
                                                className="mt-4 px-4 py-2 bg-[#00685f] text-white rounded-lg text-[14px] font-semibold"
                                            >
                                                Đăng tin ngay
                                            </button>
                                        </div>
                                    )}

                                    {!loading && recentRooms.map(room => {
                                        const s = STATUS_MAP[room.status] || { label: room.status, color: '#6d7a77', bg: '#f1f5f9', dot: '#94a3b8' };
                                        const imgUrl = room.imageUrl
                                            ? (room.imageUrl.startsWith('http') ? room.imageUrl : `${BASE_URL}${room.imageUrl}`)
                                            : null;
                                        return (
                                            <div
                                                key={room.id}
                                                className="bg-white rounded-2xl p-4 border border-[#eaf1ff] flex gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                                                onClick={() => navigate(`/landlord/listings/${room.id}`)}
                                            >
                                                {/* Ảnh */}
                                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#eaf1ff]">
                                                    {imgUrl
                                                        ? <img src={imgUrl} alt={room.title} className="w-full h-full object-cover" />
                                                        : <span className="material-symbols-outlined text-[32px] text-[#bcc9c6] w-full h-full flex items-center justify-center">image_not_supported</span>
                                                    }
                                                </div>
                                                {/* Nội dung */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                    <div>
                                                        <p className="font-semibold text-[#0b1c30] text-[15px] truncate group-hover:text-[#00685f] transition-colors">
                                                            {room.title}
                                                        </p>
                                                        <p className="text-[13px] text-[#6d7a77] mt-0.5">
                                                            {room.ward}, {room.district} · {room.area} m²
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[#ba1a1a] font-bold text-[15px]">
                                                            {room.price.toLocaleString('vi-VN')}đ/tháng
                                                        </span>
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
                                                            style={{ color: s.color, background: s.bg }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                                                            {s.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* CỘT PHẢI */}
                            <div className={styles.sideCol}>

                                {/* Thống kê tỷ lệ lấp đầy */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaf1ff] flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#00685f] text-[22px]">bar_chart</span>
                                        <h3 className="font-bold text-[16px] text-[#0b1c30]">Tỷ lệ lấp đầy</h3>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="flex h-3 rounded-full overflow-hidden bg-[#f1f5f9] gap-0.5">
                                        {kpi.total > 0 && <>
                                            {kpi.rented > 0 && <div className="bg-[#006398] transition-all duration-700" style={{ width: `${(kpi.rented / kpi.total) * 100}%` }} title="Đã cho thuê" />}
                                            {kpi.available > 0 && <div className="bg-[#00685f] transition-all duration-700" style={{ width: `${(kpi.available / kpi.total) * 100}%` }} title="Còn trống" />}
                                            {kpi.pending > 0 && <div className="bg-[#d97706] transition-all duration-700" style={{ width: `${(kpi.pending / kpi.total) * 100}%` }} title="Chờ duyệt" />}
                                            {kpi.rejected > 0 && <div className="bg-[#ba1a1a] transition-all duration-700" style={{ width: `${(kpi.rejected / kpi.total) * 100}%` }} title="Từ chối" />}
                                        </>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[13px]">
                                        {[
                                            { label: 'Đã cho thuê', count: kpi.rented, color: '#006398' },
                                            { label: 'Đang cho thuê', count: kpi.available, color: '#00685f' },
                                            { label: 'Chờ duyệt', count: kpi.pending, color: '#d97706' },
                                            { label: 'Bị từ chối', count: kpi.rejected, color: '#ba1a1a' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                                                <span className="text-[#3d4947]">{item.label}</span>
                                                <span className="font-bold ml-auto" style={{ color: item.color }}>{item.count}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-[#eff4ff] rounded-xl p-3 text-center">
                                        <p className="text-[12px] text-[#6d7a77]">Tỷ lệ đã cho thuê</p>
                                        <p className="text-[28px] font-bold text-[#006398] font-['Plus_Jakarta_Sans']">{fillRate}%</p>
                                    </div>
                                </div>

                                {/* Quy trình */}
                                <div className={`${styles.processBox} flex flex-col gap-3`}>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#00685f] text-[20px]">alt_route</span>
                                        <span className="font-bold text-[15px] text-[#0b1c30]">Quy trình đăng tin</span>
                                    </div>
                                    {[
                                        { step: '1', title: 'Đăng tin mới', desc: 'Điền đầy đủ thông tin & ảnh', color: 'bg-[#dce9ff] text-[#006398]' },
                                        { step: '2', title: 'Chờ duyệt', desc: 'Admin kiểm duyệt tin', color: 'bg-[#fef3c7] text-[#92400e]' },
                                        { step: '3', title: 'Hiển thị', desc: 'Tiếp cận người thuê', color: 'bg-[#dcfce7] text-[#065f46]' },
                                        { step: '4', title: 'Đánh dấu đã thuê', desc: 'Ẩn tin, tránh cuộc gọi rác', color: 'bg-[#cce5ff] text-[#006398]' },
                                    ].map(item => (
                                        <div key={item.step} className="flex items-center gap-3">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] flex-shrink-0 ${item.color}`}>
                                                {item.step}
                                            </span>
                                            <div>
                                                <p className="text-[13px] font-semibold text-[#0b1c30]">{item.title}</p>
                                                <p className="text-[12px] text-[#6d7a77]">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tips */}
                                <div className={styles.tipsCard}>
                                    <div className={styles.tipsDecoration}></div>
                                    <div className="flex items-center gap-2 text-[#00685f]">
                                        <span className="material-symbols-outlined text-[22px]">tips_and_updates</span>
                                        <span className="font-bold text-[16px]">Lưu ý quan trọng</span>
                                    </div>
                                    <p className="text-[14px] text-[#0b1c30] leading-relaxed">
                                        Khi phòng đã có khách cọc, hãy cập nhật trạng thái sang{' '}
                                        <span className="font-semibold text-[#006398] bg-[#cce5ff] px-1.5 py-0.5 rounded">
                                            Đã cho thuê
                                        </span>{' '}
                                        ngay để tránh cuộc gọi làm phiền.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}