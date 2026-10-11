import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { addFavorite, removeFavorite, getFavorites } from '../../Services/favoriteService';

const BASE_URL = 'https://localhost:7188';
const FALLBACK_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKe9QZcDH0lzkTSl-nLSODpVJ8EdJxTrsAa7POpFxGCS2MFIBy7XkWLmaXTVm0N0936jWfvPGXZyUmhh1F40_c5rws4O1tBSZAx8rVewiODyByjDGm5MLjuADhkR5kxWNox82BYtGkcCEfI7y37qVtRIlt4P91YNvjTAtxB8v_e_mBS475x-9fa3QgEn0JB1auTj0BpK6h-3D6NHjUMLo5nlhnT09xouI2FujXPZVSqNPrC7DMoeqf';

function buildImgUrl(url: string): string {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
}

function getStoredUser() {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

// Bổ sung hasReported để map với BE
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
    landlordName?: string;
    landlordPhone?: string;
    images?: string[];
    amenities?: { id: number; name: string }[];
    hasReported?: boolean;
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
    Available: { label: 'Còn trống', color: '#065f46', bg: '#dcfce7', dot: '#16a34a' },
    Rented: { label: 'Đã cho thuê', color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
    Pending: { label: 'Chờ duyệt', color: '#92400e', bg: '#fef3c7', dot: '#d97706' },
    Rejected: { label: 'Bị từ chối', color: '#93000a', bg: '#ffdad6', dot: '#ba1a1a' },
    Expired: { label: 'Hết hạn', color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
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

    // State cho Modal Báo cáo
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDesc, setReportDesc] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);

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

                if (data.images && data.images.length > 0) {
                    setActiveImage(buildImgUrl(data.images[0]));
                } else {
                    setActiveImage(FALLBACK_IMAGE);
                }

                if (isTenant) {
                    try {
                        const favs = await getFavorites();
                        setIsFav(favs.some((f: any) => f.roomId === data.id));
                    } catch { /* ignore */ }
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
            else { await addFavorite(room.id); setIsFav(true); }
        } catch (err: any) {
            alert(err.message || 'Không thể thực hiện thao tác này.');
        } finally {
            setFavLoading(false);
        }
    };

    const handleContactClick = () => {
        if (!token) navigate('/login');
    };

    const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setReportError(null);

        // Validation
        if (!reportReason) {
            setReportError("Vui lòng chọn lý do báo cáo.");
            return;
        }
        if (reportReason === "Lý do khác" && !reportDesc.trim()) {
            setReportError("Vui lòng mô tả thêm lý do.");
            return;
        }

        try {
            setIsReporting(true);
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${BASE_URL}/api/reports`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    roomId: room?.id,
                    reason: reportReason,
                    description: reportDesc
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                let errMsg = errData?.message;

                // Nếu BE báo trùng lặp report
                if (errMsg && (errMsg.includes("REPORT_ALREADY_EXISTS") || errMsg.includes("đã báo cáo"))) {
                    alert("Bạn đã báo cáo tin đăng này trước đó.");
                    setRoom(prev => prev ? { ...prev, hasReported: true } : prev);
                    setShowReportModal(false);
                    return;
                }

                // Xử lý câu thông báo lỗi thân thiện thay cho mã lỗi HTTP khô khan
                if (!errMsg || errMsg.trim() === "") {
                    if (response.status === 400) {
                        errMsg = "Dữ liệu gửi đi chưa hợp lệ. Vui lòng kiểm tra lại.";
                    } else if (response.status === 401 || response.status === 403) {
                        errMsg = "Phiên đăng nhập đã hết hạn hoặc bạn không có quyền thực hiện thao tác này.";
                    } else if (response.status >= 500) {
                        errMsg = "Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.";
                    } else {
                        errMsg = "Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.";
                    }
                }

                throw new Error(errMsg);
            }

            // Report thành công
            alert("Đã gửi báo cáo thành công. Quản trị viên sẽ xem xét!");
            setRoom(prev => prev ? { ...prev, hasReported: true } : prev);
            setShowReportModal(false);
            setReportReason('');
            setReportDesc('');

        } catch (err: any) {
            setReportError(err.message || "Không thể kết nối đến máy chủ.");
        } finally {
            setIsReporting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#f8f9ff] min-h-screen">
                <Header />
                <div className="max-w-[1280px] mx-auto px-4 lg:px-6 pt-24 pb-16 flex flex-col gap-6 animate-pulse">
                    <div className="h-5 w-48 bg-[#eaf1ff] rounded" />
                    <div className="h-28 bg-[#eaf1ff] rounded-2xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="w-full h-[400px] bg-[#eaf1ff] rounded-2xl" />
                            <div className="h-40 bg-[#eaf1ff] rounded-2xl" />
                        </div>
                        <div className="lg:col-span-4">
                            <div className="h-56 bg-[#eaf1ff] rounded-2xl" />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="bg-[#f8f9ff] min-h-screen">
                <Header />
                <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center">
                    <div className="bg-[#ffdad6] text-[#93000a] p-8 rounded-2xl border border-[#93000a]/20 shadow-sm">
                        <span className="material-symbols-outlined text-[56px] mb-3 block">error_outline</span>
                        <h2 className="text-[18px] font-bold mb-2">Không tìm thấy phòng</h2>
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
    const locationString = `${room.addressDetail ? room.addressDetail + ', ' : ''}${room.ward}, ${room.district}`;

    return (
        <div className="bg-[#f8f9ff] font-['Be_Vietnam_Pro'] text-[#0b1c30] antialiased min-h-screen flex flex-col relative">
            <Header />

            <main className="flex-1 pt-24 pb-16">
                <div className="max-w-[1280px] mx-auto px-4 lg:px-6 flex flex-col gap-5">

                    {/* ── Breadcrumb ── */}
                    <div className="flex items-center gap-2 text-[12px] text-[#6d7a77] flex-wrap">
                        <span className="cursor-pointer hover:text-[#00685f]" onClick={() => navigate('/')}>Trang chủ</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="cursor-pointer hover:text-[#00685f]">Phòng cho thuê</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-[#0b1c30] font-semibold truncate max-w-[220px]">{room.title}</span>
                    </div>

                    {/* ── HEADER THÔNG TIN CHÍNH ── */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eaf1ff] flex flex-col gap-3">

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
                                {room.categoryName && (
                                    <span className="px-2.5 py-1 rounded-full bg-[#008378] text-white">{room.categoryName}</span>
                                )}
                                <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                                    style={{ color: s.color, background: s.bg }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.dot }} />
                                    {s.label}
                                </span>
                            </div>

                            <span className="inline-flex items-center gap-1 text-[#6d7a77] font-medium text-[12px] bg-[#f8f9ff] px-2.5 py-1 rounded-full">
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                {room.viewCount?.toLocaleString('vi-VN') ?? 0} lượt xem
                            </span>
                        </div>

                        <h1 className="font-['Plus_Jakarta_Sans'] text-[20px] sm:text-[24px] font-bold text-[#0b1c30] leading-snug">
                            {room.title}
                        </h1>

                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 pt-1">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[#ba1a1a] text-[26px] font-bold font-['Plus_Jakarta_Sans'] leading-none">
                                    {room.price.toLocaleString('vi-VN')}
                                </span>
                                <span className="text-[#0b1c30] text-[14px] font-semibold">đ/tháng</span>
                            </div>

                            <div className="hidden md:block w-px h-6 bg-[#eaf1ff]"></div>

                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-1.5 text-[#3d4947]">
                                    <span className="material-symbols-outlined text-[#00685f] text-[20px]">square_foot</span>
                                    <span className="text-[14px] font-semibold text-[#0b1c30]">{room.area} m²</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[#3d4947] truncate max-w-[320px]" title={locationString}>
                                    <span className="material-symbols-outlined text-[#00685f] text-[20px] shrink-0">location_on</span>
                                    <span className="text-[13px] truncate font-medium">{locationString}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 2-column layout ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* ── CỘT TRÁI (8 cols) ── */}
                        <div className="lg:col-span-8 flex flex-col gap-5">

                            {/* ── Gallery ── */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaf1ff] flex flex-col gap-3">
                                <div className="relative w-full h-64 sm:h-80 md:h-[400px] rounded-xl overflow-hidden bg-[#f8f9ff]">
                                    <img
                                        src={activeImage}
                                        alt={room.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                    />
                                    {validImages.length > 1 && (
                                        <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[12px] font-semibold px-2.5 py-1 rounded-full shadow">
                                            {validImages.indexOf(
                                                validImages.find(u => buildImgUrl(u) === activeImage) || validImages[0]
                                            ) + 1} / {validImages.length} ảnh
                                        </span>
                                    )}
                                </div>

                                {validImages.length > 1 && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        {validImages.map((imgUrl, index) => {
                                            const fullUrl = buildImgUrl(imgUrl);
                                            const isActive = activeImage === fullUrl;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => setActiveImage(fullUrl)}
                                                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden transition-all border-2 ${isActive
                                                        ? 'border-[#00685f] opacity-100 shadow-sm scale-[1.02]'
                                                        : 'border-transparent opacity-60 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img
                                                        src={fullUrl}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ── Tiện ích (Grid) ── */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eaf1ff]">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#00685f] text-[22px]">checklist</span>
                                    <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#0b1c30]">Tiện ích & Cơ sở vật chất</h2>
                                </div>
                                {!room.amenities || room.amenities.length === 0 ? (
                                    <div className="bg-[#f8f9ff] p-4 rounded-xl text-center border border-[#eaf1ff]">
                                        <p className="text-[#6d7a77] text-[13px]">Chủ trọ chưa cập nhật tiện ích cho phòng này.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {room.amenities.map(amenity => (
                                            <div key={amenity.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors border border-[#eaf1ff]">
                                                <span className="material-symbols-outlined text-[#00685f] text-[20px]">{getAmenityIcon(amenity.name)}</span>
                                                <span className="text-[13px] font-semibold text-[#0b1c30]">{amenity.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Mô tả chi tiết ── */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eaf1ff]">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#00685f] text-[22px]">description</span>
                                    <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#0b1c30]">Mô tả chi tiết</h2>
                                </div>
                                {!room.description ? (
                                    <p className="text-[#6d7a77] italic text-[14px]">Chủ trọ chưa cập nhật mô tả chi tiết.</p>
                                ) : (
                                    <div className="whitespace-pre-wrap text-[14px] text-[#3d4947] leading-relaxed font-normal">
                                        {room.description}
                                    </div>
                                )}
                            </div>

                            {/* ── Vị trí Map ── */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eaf1ff]">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#ba1a1a] text-[22px]">pin_drop</span>
                                    <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#0b1c30]">Vị trí phòng</h2>
                                </div>
                                <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#eaf1ff] flex flex-col gap-2">
                                    <div className="flex items-start gap-2.5">
                                        <span className="material-symbols-outlined text-[#00685f] text-[18px] mt-0.5">map</span>
                                        <div>
                                            <p className="text-[12px] text-[#6d7a77] font-medium mb-0.5">Khu vực</p>
                                            <p className="text-[14px] font-bold text-[#0b1c30]">{room.ward}, {room.district}</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-[#eaf1ff] my-1"></div>
                                    <div className="flex items-start gap-2.5">
                                        <span className="material-symbols-outlined text-[#00685f] text-[18px] mt-0.5">signpost</span>
                                        <div>
                                            <p className="text-[12px] text-[#6d7a77] font-medium mb-0.5">Địa chỉ chi tiết</p>
                                            <p className="text-[14px] font-medium text-[#3d4947]">{room.addressDetail}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* ── CỘT PHẢI (SIDEBAR CONTACT) ── */}
                        <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-24">

                            {/* Contact Card */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#00685f]/30 flex flex-col gap-5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00685f] to-[#008378]"></div>

                                <div className="flex items-center gap-3 pt-1">
                                    <div className="w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#00685f] font-bold text-[18px] border border-[#eaf1ff]">
                                        {room.landlordName ? room.landlordName.charAt(0).toUpperCase() : 'C'}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[#6d7a77] text-[11px] font-semibold uppercase tracking-wider mb-0.5">Được đăng bởi</p>
                                        <p className="font-bold text-[#0b1c30] text-[16px] leading-tight font-['Plus_Jakarta_Sans']">{room.landlordName || 'Chủ trọ ẩn danh'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    {room.landlordPhone ? (
                                        <a href={`tel:${room.landlordPhone}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00685f] hover:bg-[#00524a] text-white font-bold text-[15px] shadow-sm transition-all active:scale-95">
                                            <span className="material-symbols-outlined text-[20px]">call</span>
                                            {room.landlordPhone}
                                        </a>
                                    ) : (
                                        <button
                                            onClick={handleContactClick}
                                            disabled={room.status !== 'Available'}
                                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[15px] transition-all border ${room.status !== 'Available'
                                                ? 'bg-[#f1f5f9] text-[#64748b] cursor-not-allowed border-[#e2e8f0]'
                                                : 'bg-[#00685f] hover:bg-[#00524a] text-white border-transparent active:scale-95'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {room.status !== 'Available' ? 'phone_disabled' : 'lock'}
                                            </span>
                                            {room.status !== 'Available' ? 'Không khả dụng' : 'Đăng nhập xem SĐT'}
                                        </button>
                                    )}

                                    {/* Action Buttons: Chỉ hiện Báo cáo cho Tenant */}
                                    <div className={`flex items-center ${isTenant ? 'gap-2' : ''}`}>
                                        <button
                                            onClick={handleToggleFav}
                                            disabled={favLoading}
                                            className={`${isTenant ? 'flex-1' : 'w-full'} flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-bold text-[13px] transition-all active:scale-95 border ${isFav
                                                ? 'bg-[#ffdad6] border-[#ffdad6] text-[#93000a] hover:bg-[#93000a] hover:text-white'
                                                : 'bg-white border-[#eaf1ff] text-[#0b1c30] hover:bg-[#f8f9ff] hover:border-[#00685f]'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{isFav ? 'favorite' : 'favorite_border'}</span>
                                            <span className="truncate">{isFav ? 'Đã lưu' : 'Lưu tin'}</span>
                                        </button>

                                        {isTenant && (
                                            room.hasReported ? (
                                                <button
                                                    disabled
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-bold text-[13px] border bg-[#f1f5f9] border-[#e2e8f0] text-[#64748b] cursor-not-allowed"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                                    <span className="truncate">Đã báo cáo</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setShowReportModal(true)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-bold text-[13px] transition-all active:scale-95 border bg-white border-[#eaf1ff] text-[#6d7a77] hover:bg-[#ffdad6] hover:text-[#93000a] hover:border-[#ffdad6]"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">flag</span>
                                                    <span className="truncate">Báo cáo</span>
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#fff9e6] border border-[#ffdf70] p-3.5 rounded-2xl flex gap-2.5 text-[#7a5900] text-[12px] leading-relaxed">
                                <span className="material-symbols-outlined flex-shrink-0 text-[18px] mt-0.5 text-[#e5a500]">security</span>
                                <p><strong>Mẹo an toàn:</strong> Tuyệt đối không chuyển tiền cọc trước khi xem phòng trực tiếp và ký hợp đồng rõ ràng.</p>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* ── MODAL BÁO CÁO (SIDE DRAWER) ── */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-[440px] bg-white h-full shadow-2xl flex flex-col z-50 transform transition-transform duration-300 translate-x-0">

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-[#eaf1ff] flex items-center justify-between bg-white">
                            <h2 className="text-[20px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">Phản ánh tin đăng</h2>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="text-[#6d7a77] hover:text-[#0b1c30] p-1.5 rounded-full hover:bg-[#f8f9ff] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[24px]">close</span>
                            </button>
                        </div>

                        {/* Form */}
                        <form id="reportForm" onSubmit={handleReportSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

                            {reportError && (
                                <div className="bg-[#ffdad6] text-[#93000a] px-4 py-3 rounded-xl text-[13px] font-medium border border-[#93000a]/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {reportError}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <p className="text-[15px] text-[#0b1c30] font-bold">Lý do phản ánh <span className="text-[#ba1a1a]">*</span></p>
                                <div className="flex flex-col gap-1 pt-1">
                                    {[
                                        "Tin có dấu hiệu lừa đảo",
                                        "Tin trùng lặp nội dung",
                                        "Không liên hệ được chủ tin đăng",
                                        "Thông tin không đúng thực tế",
                                        "Lý do khác"
                                    ].map((reason) => (
                                        <label key={reason} className="flex items-center gap-3 cursor-pointer py-2 group">
                                            <input
                                                type="radio"
                                                name="report_reason"
                                                value={reason}
                                                checked={reportReason === reason}
                                                onChange={(e) => setReportReason(e.target.value)}
                                                className="w-4 h-4 text-[#00685f] accent-[#00685f] cursor-pointer"
                                            />
                                            <span className={`text-[14px] transition-colors ${reportReason === reason ? 'text-[#00685f] font-bold' : 'text-[#3d4947] group-hover:text-[#00685f]'}`}>
                                                {reason}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="detailNote" className="text-[14px] text-[#0b1c30] font-bold">
                                    Mô tả thêm {reportReason === 'Lý do khác' && <span className="text-[#ba1a1a]">*</span>}
                                </label>
                                <textarea
                                    id="detailNote"
                                    rows={4}
                                    className="w-full bg-[#f8f9ff] rounded-xl p-3.5 text-[14px] text-[#0b1c30] placeholder:text-[#aab8b5] outline-none focus:bg-white focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f] border border-[#eaf1ff] transition-all resize-none shadow-sm"
                                    placeholder="Mô tả chi tiết nội dung vi phạm..."
                                    value={reportDesc}
                                    onChange={(e) => setReportDesc(e.target.value)}
                                    maxLength={500}
                                ></textarea>
                                <div className={`text-right text-[12px] font-medium ${reportDesc.length >= 450 ? 'text-[#ba1a1a]' : 'text-[#6d7a77]'}`}>
                                    {reportDesc.length} / 500 ký tự
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="px-6 py-5 border-t border-[#eaf1ff] flex items-center justify-end gap-3 bg-white">
                            <button
                                type="button"
                                onClick={() => setShowReportModal(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-[#475569] bg-transparent hover:bg-[#f1f5f9] transition-colors"
                                disabled={isReporting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                form="reportForm"
                                disabled={isReporting}
                                className="px-6 py-2.5 rounded-xl font-bold text-[14px] text-white bg-[#00685f] hover:bg-[#00524a] shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isReporting ? (
                                    <>
                                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Gửi phản ánh
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}