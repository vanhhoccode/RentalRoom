import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { addFavorite, removeFavorite, getFavorites } from '../../Services/favoriteService';

const BASE_URL = 'https://localhost:7188';
const FALLBACK_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKe9QZcDH0lzkTSl-nLSODpVJ8EdJxTrsAa7POpFxGCS2MFIBy7XkWLmaXTVm0N0936jWfvPGXZyUmhh1F40_c5rws4O1tBSZAx8rVewiODyByjDGm5MLjuADhkR5kxWNox82BYtGkcCEfI7y37qVtRIlt4P91YNvjTAtxB8v_e_mBS475x-9fa3QgEn0JB1auTj0BpK6h-3D6NHjUMLo5nlhnT09xouI2FujXPZVSqNPrC7DMoeqf';

// Chuẩn hóa URL ảnh: tránh duplicate BASE_URL, hỗ trợ cả 3 dạng
function buildImgUrl(url: string): string {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
}

// Đọc an toàn từ localStorage
function getStoredUser() {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export interface RoomDetailDto {
    id: number;
    title: string;
    description?: string;
    price: number;
    area: number;
    district: string;
    ward: string;
    addressDetail: string;
    status: string;
    viewCount?: number;
    categoryName?: string;
    images?: string[];
    amenities?: { id: number; name: string }[];
}

const getAmenityIcon = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('wifi') || n.includes('mạng') || n.includes('internet')) return 'wifi';
    if (n.includes('điều hòa') || n.includes('máy lạnh')) return 'ac_unit';
    if (n.includes('tủ lạnh')) return 'kitchen';
    if (n.includes('máy giặt') || n.includes('phơi')) return 'local_laundry_service';
    if (n.includes('giường')) return 'bed';
    if (n.includes('nóng lạnh') || n.includes('bình tắm')) return 'water_heater';
    if (n.includes('ban công')) return 'balcony';
    if (n.includes('để xe') || n.includes('hầm xe')) return 'two_wheeler';
    if (n.includes('bảo vệ') || n.includes('camera') || n.includes('an ninh')) return 'security';
    if (n.includes('thang máy')) return 'elevator';
    if (n.includes('vân tay') || n.includes('khóa')) return 'fingerprint';
    if (n.includes('pccc') || n.includes('cháy')) return 'local_fire_department';
    return 'check_circle';
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    Available: { label: 'Đang cho thuê', color: '#065f46', bg: '#dcfce7', dot: '#16a34a' },
    Rented:    { label: 'Đã cho thuê',   color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
    Pending:   { label: 'Chờ duyệt',     color: '#92400e', bg: '#fef3c7', dot: '#d97706' },
};

export default function RoomDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [room, setRoom] = useState<RoomDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<string>(FALLBACK_IMAGE);
    const [isFav, setIsFav] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    const token = localStorage.getItem('accessToken');
    const storedUser = getStoredUser();
    const isTenant = !!token && storedUser?.roleCode === 'TENANT';

    useEffect(() => {
        if (!id) return;

        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);

                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`${BASE_URL}/api/rooms/${id}`, { headers });
                if (res.status === 404) throw new Error('Phòng không tồn tại hoặc đã bị xóa.');
                if (!res.ok) throw new Error(`Lỗi ${res.status}`);

                const data: RoomDetailDto = await res.json();
                setRoom(data);

                // Set ảnh đầu tiên làm active
                if (data.images && data.images.length > 0) {
                    setActiveImage(buildImgUrl(data.images[0]));
                } else {
                    setActiveImage(FALLBACK_IMAGE);
                }

                // Kiểm tra đã yêu thích chưa (chỉ tenant)
                if (isTenant) {
                    try {
                        const favs = await getFavorites();
                        setIsFav(favs.some((f: any) => f.roomId === data.id));
                    } catch { /* bỏ qua */ }
                }
            } catch (err: any) {
                setError(err.message || 'Đã xảy ra lỗi.');
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [id]);

    const handleToggleFav = async () => {
        if (!isTenant) { navigate('/login'); return; }
        if (!room) return;
        setFavLoading(true);
        try {
            if (isFav) { await removeFavorite(room.id); setIsFav(false); }
            else        { await addFavorite(room.id);    setIsFav(true); }
        } catch (err: any) {
            alert(err.message || 'Không thể thực hiện thao tác này.');
        } finally {
            setFavLoading(false);
        }
    };

    // ── Loading skeleton ──────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-[#f8f9ff] min-h-screen">
                <Header />
                <div className="max-w-[1280px] mx-auto px-4 lg:px-6 pt-24 pb-16 flex flex-col gap-6 animate-pulse">
                    <div className="h-5 w-48 bg-[#eaf1ff] rounded" />
                    <div className="h-28 bg-[#eaf1ff] rounded-2xl" />
                    <div className="w-full h-96 bg-[#eaf1ff] rounded-2xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 flex flex-col gap-4">
                            <div className="h-40 bg-[#eaf1ff] rounded-2xl" />
                            <div className="h-32 bg-[#eaf1ff] rounded-2xl" />
                            <div className="h-48 bg-[#eaf1ff] rounded-2xl" />
                        </div>
                        <div className="lg:col-span-4">
                            <div className="h-64 bg-[#eaf1ff] rounded-2xl" />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────
    if (error || !room) {
        return (
            <div className="bg-[#f8f9ff] min-h-screen">
                <Header />
                <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center">
                    <div className="bg-[#ffdad6] text-[#93000a] p-8 rounded-2xl border border-[#93000a]/20 shadow-sm">
                        <span className="material-symbols-outlined text-[56px] mb-3 block">error_outline</span>
                        <h2 className="text-[20px] font-bold mb-2">Không tìm thấy phòng</h2>
                        <p className="text-[14px] mb-6">{error || 'Phòng này không còn tồn tại hoặc đã bị xóa.'}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-5 py-2.5 bg-[#93000a] text-white rounded-xl font-semibold text-[14px]"
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const validImages = room.images && room.images.length > 0 ? room.images : [];
    const s = STATUS_MAP[room.status] || { label: room.status, color: '#6d7a77', bg: '#f1f5f9', dot: '#94a3b8' };

    return (
        <div className="bg-[#f8f9ff] font-['Be_Vietnam_Pro'] text-[#0b1c30] antialiased min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-24 pb-16">
                <div className="max-w-[1280px] mx-auto px-4 lg:px-6 flex flex-col gap-6">

                    {/* ── Breadcrumb ── */}
                    <div className="flex items-center gap-2 text-[13px] text-[#6d7a77] flex-wrap">
                        <span className="cursor-pointer hover:text-[#00685f]" onClick={() => navigate('/')}>Trang chủ</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="cursor-pointer hover:text-[#00685f]">Phòng cho thuê</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-[#0b1c30] font-semibold truncate max-w-[220px]">{room.title}</span>
                    </div>

                    {/* ── Title & Status ── */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
                            {room.categoryName && (
                                <span className="px-2.5 py-1 rounded-full bg-[#008378] text-white">{room.categoryName}</span>
                            )}
                            <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                                style={{ color: s.color, background: s.bg }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.dot }} />
                                {s.label}
                            </span>
                            <span className="ml-auto inline-flex items-center gap-1 text-[#6d7a77] font-normal text-[12px]">
                                <span className="material-symbols-outlined text-[15px]">visibility</span>
                                {room.viewCount?.toLocaleString('vi-VN') ?? 0} lượt xem
                            </span>
                        </div>
                        <h1 className="font-['Plus_Jakarta_Sans'] text-[22px] md:text-[28px] font-bold text-[#0b1c30] leading-snug">
                            {room.title}
                        </h1>
                        <div className="flex items-center gap-1.5 text-[#3d4947] text-[14px]">
                            <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0">location_on</span>
                            {room.addressDetail}, {room.ward}, {room.district}
                        </div>
                    </div>

                    {/* ── Gallery ── */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                        {/* Ảnh lớn */}
                        <div className="relative w-full h-72 sm:h-96 md:h-[460px] rounded-xl overflow-hidden bg-[#111]">
                            <img
                                src={activeImage}
                                alt={room.title}
                                className="w-full h-full object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                            />
                            {validImages.length > 1 && (
                                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[12px] font-semibold px-2.5 py-1 rounded-full">
                                    {validImages.indexOf(
                                        validImages.find(u => buildImgUrl(u) === activeImage) || validImages[0]
                                    ) + 1} / {validImages.length}
                                </span>
                            )}
                        </div>

                        {/* Thumbnails — chỉ hiện khi có > 1 ảnh */}
                        {validImages.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {validImages.map((imgUrl, index) => {
                                    const fullUrl = buildImgUrl(imgUrl);
                                    const isActive = activeImage === fullUrl;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(fullUrl)}
                                            className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden transition-all border-2 ${
                                                isActive
                                                    ? 'border-[#00685f] opacity-100 shadow-md'
                                                    : 'border-transparent opacity-50 hover:opacity-90'
                                            }`}
                                        >
                                            <img
                                                src={fullUrl}
                                                alt={`Ảnh ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── 2-column layout ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* ── CỘT TRÁI (8 cols) ── */}
                        <div className="lg:col-span-8 flex flex-col gap-5">

                            {/* Thông số cơ bản */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 bg-[#eff4ff] p-4 rounded-xl">
                                    <div>
                                        <span className="text-[#3d4947] text-[12px] font-semibold uppercase tracking-wider">Giá thuê / tháng</span>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-[#ba1a1a] text-[26px] font-bold font-['Plus_Jakarta_Sans']">
                                                {room.price.toLocaleString('vi-VN')}
                                            </span>
                                            <span className="text-[#0b1c30] text-[15px] font-semibold">đ/tháng</span>
                                        </div>
                                    </div>
                                    <span
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold self-start"
                                        style={{ color: s.color, background: s.bg }}
                                    >
                                        <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                                        {s.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { icon: 'square_foot',   label: 'Diện tích',  value: `${room.area} m²`,               color: '#00685f' },
                                        { icon: 'home_work',     label: 'Loại hình',  value: room.categoryName || 'Phòng trọ', color: '#006398' },
                                        { icon: 'location_city', label: 'Quận/Huyện', value: room.district,                   color: '#00685f' },
                                    ].map(item => (
                                        <div key={item.label} className="p-4 rounded-xl bg-[#f8f9ff] flex flex-col gap-1 border border-[#eaf1ff]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[18px]" style={{ color: item.color }}>{item.icon}</span>
                                                <span className="text-[12px] font-semibold text-[#3d4947]">{item.label}</span>
                                            </div>
                                            <span className="text-[15px] font-semibold text-[#0b1c30]">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tiện ích */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#00685f] text-[22px]">checklist</span>
                                    <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#0b1c30]">Tiện ích & Cơ sở vật chất</h2>
                                </div>
                                {!room.amenities || room.amenities.length === 0 ? (
                                    <p className="text-[#6d7a77] italic text-[14px]">Phòng chưa cập nhật thông tin tiện ích.</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {room.amenities.map(amenity => (
                                            <div key={amenity.id} className="flex items-center gap-2 p-3 rounded-xl bg-[#eff4ff] border border-[#eaf1ff]">
                                                <span className="material-symbols-outlined text-[#00685f] text-[20px]">{getAmenityIcon(amenity.name)}</span>
                                                <span className="text-[14px] font-medium text-[#0b1c30]">{amenity.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mô tả */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#00685f] text-[22px]">description</span>
                                    <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#0b1c30]">Mô tả chi tiết</h2>
                                </div>
                                <div className="whitespace-pre-wrap text-[15px] text-[#3d4947] leading-relaxed">
                                    {room.description || 'Chưa có mô tả chi tiết.'}
                                </div>
                            </div>

                            {/* Vị trí */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#00685f] text-[22px]">location_on</span>
                                    <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#0b1c30]">Vị trí phòng</h2>
                                </div>
                                <div className="flex flex-col gap-2 text-[14px] text-[#3d4947]">
                                    {[
                                        { label: 'Địa chỉ',    value: room.addressDetail },
                                        { label: 'Phường/Xã',  value: room.ward },
                                        { label: 'Quận/Huyện', value: room.district },
                                    ].map(row => (
                                        <div key={row.label} className="flex gap-2">
                                            <span className="font-semibold text-[#0b1c30] w-24 shrink-0">{row.label}</span>
                                            <span>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── CỘT PHẢI (4 cols) ── */}
                        <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-24">

                            {/* Contact card */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#00685f]/20 flex flex-col gap-4">
                                <div className="text-center pb-4 border-b border-[#eaf1ff]">
                                    <p className="text-[#6d7a77] text-[13px] font-semibold mb-1">Giá thuê mỗi tháng</p>
                                    <p className="text-[28px] font-bold text-[#ba1a1a] font-['Plus_Jakarta_Sans']">
                                        {room.price.toLocaleString('vi-VN')}đ
                                    </p>
                                    <p className="text-[13px] text-[#6d7a77] mt-0.5">~ {(room.price / 1_000_000).toFixed(1)} triệu/tháng</p>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white font-semibold text-[15px] shadow transition-all active:scale-95">
                                        <span className="material-symbols-outlined text-[20px]">call</span>
                                        Liên hệ chủ nhà
                                    </button>
                                    <button
                                        onClick={handleToggleFav}
                                        disabled={favLoading}
                                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-[15px] transition-all active:scale-95 border ${
                                            isFav
                                                ? 'bg-[#ffdad6] border-[#ffdad6] text-[#93000a] hover:bg-[#93000a] hover:text-white'
                                                : 'bg-white border-[#eaf1ff] text-[#0b1c30] hover:bg-[#eff4ff]'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                                        {isFav ? 'Đã lưu phòng này' : 'Lưu phòng yêu thích'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[13px]">
                                    <div className="p-3 bg-[#f8f9ff] rounded-xl">
                                        <p className="text-[#6d7a77]">Diện tích</p>
                                        <p className="font-bold text-[#0b1c30] mt-0.5">{room.area} m²</p>
                                    </div>
                                    <div className="p-3 bg-[#f8f9ff] rounded-xl">
                                        <p className="text-[#6d7a77]">Loại hình</p>
                                        <p className="font-bold text-[#0b1c30] mt-0.5 truncate">{room.categoryName || 'Phòng trọ'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cảnh báo an toàn */}
                            <div className="bg-[#ffdad6]/40 border border-[#ffdad6] p-4 rounded-2xl flex gap-3 text-[#93000a] text-[13px] leading-relaxed">
                                <span className="material-symbols-outlined flex-shrink-0 text-[20px] mt-0.5">warning</span>
                                <p><strong>Cảnh báo:</strong> Xem phòng trực tiếp và <strong>không chuyển tiền</strong> trước khi gặp chủ nhà.</p>
                            </div>

                            {/* Tips */}
                            <div className="bg-[#eff4ff] border border-[#eaf1ff] p-4 rounded-2xl flex gap-3 text-[#006398] text-[13px] leading-relaxed">
                                <span className="material-symbols-outlined flex-shrink-0 text-[20px] mt-0.5">tips_and_updates</span>
                                <p>Lưu vào <strong>yêu thích</strong> để so sánh nhiều phòng dễ dàng hơn.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}