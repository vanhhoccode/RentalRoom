import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LandlordSidebar from '../../../Components/LandLordSidebar/LandlordSidebar';
import { changeRoomStatus, deleteRoom } from '../../../Services/roomService';

const BASE_URL = 'https://localhost:7188';
const FALLBACK_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKe9QZcDH0lzkTSl-nLSODpVJ8EdJxTrsAa7POpFxGCS2MFIBy7XkWLmaXTVm0N0936jWfvPGXZyUmhh1F40_c5rws4O1tBSZAx8rVewiODyByjDGm5MLjuADhkR5kxWNox82BYtGkcCEfI7y37qVtRIlt4P91YNvjTAtxB8v_e_mBS475x-9fa3QgEn0JB1auTj0BpK6h-3D6NHjUMLo5nlhnT09xouI2FujXPZVSqNPrC7DMoeqf';

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
    rejectReason?: string; // Bổ sung trường lý do từ chối từ API
    viewCount?: number;
    images?: string[];
    amenities?: { id: number; name: string }[];
    categoryName?: string;
}

const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi') || lower.includes('mạng')) return 'wifi';
    if (lower.includes('điều hòa') || lower.includes('máy lạnh')) return 'ac_unit';
    if (lower.includes('tủ lạnh')) return 'kitchen';
    if (lower.includes('máy giặt') || lower.includes('phơi')) return 'local_laundry_service';
    if (lower.includes('giường')) return 'bed';
    if (lower.includes('ban công')) return 'balcony';
    if (lower.includes('để xe')) return 'two_wheeler';
    if (lower.includes('vân tay') || lower.includes('khóa')) return 'fingerprint';
    if (lower.includes('pccc') || lower.includes('cháy')) return 'local_fire_department';
    return 'check_circle';
};

export default function LandlordRoomDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [room, setRoom] = useState<RoomDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<string>(FALLBACK_IMAGE);

    useEffect(() => {
        const fetchRoomDetail = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${BASE_URL}/api/rooms/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token ?? ''}`
                    }
                });

                if (response.status === 404) throw new Error("Phòng không tồn tại hoặc đã bị xóa.");
                if (!response.ok) throw new Error("Lỗi khi tải dữ liệu phòng.");

                const data: RoomDetailDto = await response.json();
                setRoom(data);
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0].startsWith('http') ? data.images[0] : `${BASE_URL}${data.images[0]}`);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchRoomDetail();
    }, [id]);

    const handleEdit = () => {
        if (room?.status === 'Rented') {
            alert('Không thể chỉnh sửa phòng đã cho thuê!');
            return;
        }
        navigate(`/landlord/edit/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tin đăng này? Thao tác không thể hoàn tác.')) {
            try {
                await deleteRoom(id as string);
                alert('Xóa tin thành công!');
                navigate('/landlord/listings');
            } catch (err: any) {
                alert(err.message || 'Lỗi khi xóa tin.');
            }
        }
    };

    const handleToggleStatus = async () => {
        if (!room) return;

        // 1. Tin đang chờ duyệt
        if (room.status === 'Pending') {
            alert('Tin đang chờ duyệt, bạn không thể đổi trạng thái.');
            return;
        }

        // 2. Tin bị từ chối hoặc hết hạn
        if (room.status === 'Rejected' || room.status === 'Expired') {
            alert(
                'Không thể trực tiếp đổi trạng thái tin đã bị từ chối ' +
                'hoặc hết hạn. Vui lòng chỉnh sửa tin và gửi Admin duyệt lại.'
            );
            return;
        }

        // 3. Chỉ xử lý hai trạng thái hợp lệ
        if (room.status !== 'Available' && room.status !== 'Rented') {
            alert('Trạng thái phòng không hợp lệ.');
            return;
        }

        // 4. Xác định trạng thái tiếp theo
        const newStatus = room.status === 'Available'
            ? 'Rented'
            : 'Available';

        const confirmMsg = newStatus === 'Rented'
            ? 'Xác nhận phòng này đã có khách thuê? Trạng thái sẽ chuyển sang "Đã cho thuê".'
            : 'Xác nhận khách thuê đã chuyển đi và phòng hiện đã trống? Trạng thái sẽ chuyển về "Còn trống" và tin có thể hiển thị lại cho người tìm phòng.';

        // 5. Xác nhận và gọi API
        if (window.confirm(confirmMsg)) {
            try {
                await changeRoomStatus(id as string, newStatus);

                setRoom({ ...room, status: newStatus });
            } catch (err: any) {
                alert(err.message || 'Lỗi khi đổi trạng thái.');
            }
        }
    };

    if (loading) return <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center text-[#00685f]"><span className="material-symbols-outlined animate-spin text-[40px]">progress_activity</span></div>;
    if (error || !room) return <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center text-[#ba1a1a]"><span className="material-symbols-outlined text-[40px] mr-2">error</span> {error}</div>;

    const validImages = room.images && room.images.length > 0 ? room.images : [];

    return (
        <div className="bg-[#f8f9ff] font-['Be_Vietnam_Pro'] text-[#0b1c30] antialiased min-h-screen flex flex-col">
            <LandlordSidebar />

            <div className="pl-64 flex flex-col min-h-screen w-full">
                <main className="w-full flex-1 p-4 lg:p-8">
                    <div className="max-w-[1280px] w-full mx-auto flex flex-col gap-6">

                        {/* 1. TOP ACTION BAR */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm">
                            <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2 text-[#3d4947] text-[12px] font-semibold">
                                    <span>Chủ trọ</span>
                                    <span className="text-[#bcc9c6]">/</span>
                                    <span className="cursor-pointer hover:text-[#00685f] transition-colors" onClick={() => navigate('/landlord/listings')}>Tin của tôi</span>
                                    <span className="text-[#bcc9c6]">/</span>
                                    <span className="text-[#0b1c30] truncate">Chi tiết phòng #{room.id}</span>
                                </div>
                                <button onClick={() => navigate('/landlord/listings')} className="inline-flex items-center gap-1.5 text-[#00685f] hover:text-[#008378] text-[20px] font-bold font-['Plus_Jakarta_Sans'] transition-colors w-fit group">
                                    <span className="material-symbols-outlined text-[22px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                                    Quay lại danh sách
                                </button>
                            </div>
                            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                                <button
                                    onClick={() => room.status !== 'Pending' && room.status !== 'Rejected' && window.open(`/rooms/${room.id}`, '_blank')}
                                    disabled={room.status === 'Pending' || room.status === 'Rejected'}
                                    title={room.status === 'Pending' ? 'Tin chưa được duyệt, khách chưa thể xem' : room.status === 'Rejected' ? 'Tin đã bị từ chối, không thể xem' : 'Xem như khách'}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[14px] font-semibold transition-colors ${room.status === 'Pending' || room.status === 'Rejected' ? 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed' : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30]'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px] text-[#006398]">visibility</span> Xem trang khách
                                </button>
                                <button onClick={handleEdit} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-[14px] font-semibold transition-colors">
                                    <span className="material-symbols-outlined text-[18px] text-[#00685f]">edit</span> Chỉnh sửa tin
                                </button>
                                <button onClick={handleToggleStatus} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-[14px] font-semibold shadow-sm transition-all active:scale-95">
                                    <span className="material-symbols-outlined text-[18px]">sync_alt</span> Đổi trạng thái
                                </button>
                                <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white text-[#93000a] text-[14px] font-semibold transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">delete</span> <span className="hidden sm:inline">Xóa tin</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. HEADER SUMMARY */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
                                {room.status === 'Available' && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#065f46]">
                                        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span> Có sẵn (Available)
                                    </span>
                                )}
                                {room.status === 'Rented' && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f5f9] text-[#334155]">
                                        <span className="w-2 h-2 rounded-full bg-[#94a3b8]"></span> Đã cho thuê (Rented)
                                    </span>
                                )}
                                {room.status === 'Pending' && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] text-[#b45309]">
                                        <span className="material-symbols-outlined text-[14px]">hourglass_top</span> Chờ duyệt (Pending)
                                    </span>
                                )}
                                {room.status === 'Rejected' && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a]">
                                        <span className="material-symbols-outlined text-[14px]">block</span> Bị từ chối (Rejected)
                                    </span>
                                )}
                                <span className="px-2.5 py-1 rounded-full bg-[#e5eeff] text-[#3d4947]">Mã phòng: <strong className="text-[#0b1c30]">#{room.id}</strong></span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#006947]">
                                    <span className="material-symbols-outlined text-[14px]">verified</span> Đã kiểm duyệt tự động
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <h1 className="font-['Plus_Jakarta_Sans'] text-[24px] md:text-[32px] font-bold text-[#0b1c30] tracking-tight leading-tight">
                                    {room.title}
                                </h1>
                                <div className="flex items-center gap-1.5 text-[#3d4947] text-[14px]">
                                    <span className="material-symbols-outlined text-[18px] text-[#00685f] shrink-0">location_on</span>
                                    <span>{room.addressDetail}, {room.ward}, {room.district}</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. 2-COLUMN LAYOUT */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                            {/* CỘT TRÁI (8 cols) */}
                            <div className="lg:col-span-8 flex flex-col gap-6">

                                {/* HIỂN THỊ LÝ DO TỪ CHỐI (Nếu có) */}
                                {room.status === 'Rejected' && (
                                    <div className="bg-[#fff9e6] border border-[#ffdf70] p-5 rounded-2xl flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#ffea9d] text-[#936b00] flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[24px]">gpp_bad</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[#7a5900] text-[16px]">
                                                Tin đăng này đã bị quản trị viên từ chối duyệt
                                            </h3>
                                            <p className="text-[#3d4947] text-[14px] leading-relaxed">
                                                <strong className="text-[#0b1c30]">Lý do từ chối:</strong> {room.rejectReason || "Tin đăng vi phạm chính sách nội dung của hệ thống (Chưa rõ chi tiết)."}
                                            </p>
                                            <p className="text-[#6d7a77] text-[13px] mt-1">
                                                Vui lòng <span className="font-semibold text-[#00685f] cursor-pointer hover:underline" onClick={handleEdit}>Chỉnh sửa tin</span> theo đúng quy định để được duyệt lại.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Photo Gallery */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-3">
                                    <div className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-xl overflow-hidden group bg-[#111]">
                                        <img src={activeImage} alt="Main" className="w-full h-full object-contain transition-transform duration-500" />
                                    </div>
                                    {validImages.length > 0 && (
                                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {validImages.map((imgUrl, index) => {
                                                const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => setActiveImage(fullUrl)}
                                                        className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden transition-all border-2 ${activeImage === fullUrl ? 'border-[#00685f] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                                    >
                                                        <img src={fullUrl} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Specs Bento */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 bg-[#eff4ff]/60 p-4 rounded-xl border border-[#eaf1ff]">
                                        <div className="flex flex-col">
                                            <span className="text-[#3d4947] text-[12px] font-semibold uppercase tracking-wider">Giá thuê niêm yết</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-[#ba1a1a] text-[28px] font-bold font-['Plus_Jakarta_Sans']">{room.price.toLocaleString('vi-VN')}</span>
                                                <span className="text-[#0b1c30] text-[16px] font-semibold font-['Plus_Jakarta_Sans']">đ/tháng</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col gap-1 border border-[#eaf1ff]">
                                            <div className="flex items-center gap-1.5 text-[#3d4947]">
                                                <span className="material-symbols-outlined text-[18px] text-[#00685f]">square_foot</span>
                                                <span className="text-[12px] font-semibold">Diện tích</span>
                                            </div>
                                            <span className="text-[16px] font-semibold font-['Plus_Jakarta_Sans'] text-[#0b1c30]">{room.area} m²</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col gap-1 border border-[#eaf1ff]">
                                            <div className="flex items-center gap-1.5 text-[#3d4947]">
                                                <span className="material-symbols-outlined text-[18px] text-[#00685f]">home_work</span>
                                                <span className="text-[12px] font-semibold">Loại hình</span>
                                            </div>
                                            <span className="text-[16px] font-semibold font-['Plus_Jakarta_Sans'] text-[#0b1c30]">{room.categoryName || 'Cập nhật sau'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4 border border-[#eaf1ff]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#00685f] text-[22px]">checklist</span>
                                            <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#0b1c30]">Tiện ích & Cơ sở vật chất</h2>
                                        </div>
                                    </div>
                                    {!room.amenities || room.amenities.length === 0 ? (
                                        <p className="text-[#6d7a77] italic text-[14px]">Phòng chưa cập nhật thông tin tiện ích.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {room.amenities.map(amenity => (
                                                <div key={amenity.id} className="flex items-center gap-2 p-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] border border-[#eaf1ff]">
                                                    <span className="material-symbols-outlined text-[#00685f] text-[20px]">{getAmenityIcon(amenity.name)}</span>
                                                    <span className="text-[14px] font-medium">{amenity.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4 border border-[#eaf1ff]">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#00685f] text-[22px]">description</span>
                                        <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#0b1c30]">Mô tả chi tiết phòng trọ</h2>
                                    </div>
                                    <div className="whitespace-pre-wrap text-[15px] text-[#3d4947] leading-relaxed">
                                        {room.description || "Chưa có mô tả chi tiết."}
                                    </div>
                                </div>
                            </div>

                            {/* CỘT PHẢI (4 cols) */}
                            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">

                                {/* Status Control */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4 border border-[#eaf1ff]">
                                    <div className="flex items-center justify-between border-b border-[#eaf1ff] pb-2">
                                        <span className="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-[#0b1c30]">Cập nhật trạng thái</span>
                                        <span className="material-symbols-outlined text-[#bcc9c6] text-[20px]">tune</span>
                                    </div>

                                    <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[12px] font-semibold text-[#3d4947]">Tình trạng hiển thị</span>
                                            {room.status === 'Available' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-[12px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span> Còn phòng
                                                </span>
                                            ) : room.status === 'Rented' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-[12px] font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#64748b]"></span> Đã thuê
                                                </span>
                                            ) : room.status === 'Rejected' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[12px] font-semibold">Từ chối</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffedd5] text-[#9a3412] text-[12px] font-semibold">Chờ duyệt</span>
                                            )}
                                        </div>
                                    </div>

                                    {room.status === 'Available' && (
                                        <div className="flex flex-col gap-1.5">
                                            <button onClick={handleToggleStatus} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#0b1c30] font-semibold text-[14px] transition-colors active:scale-95">
                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                Đánh dấu: Đã cho thuê
                                            </button>
                                            <p className="text-[12px] text-[#6d7a77] text-center leading-snug mt-1">
                                                Khi đổi sang Đã cho thuê, hệ thống sẽ ẩn bài khỏi trang tìm kiếm.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Analytics */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4 border border-[#eaf1ff]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#00685f] text-[20px]">query_stats</span>
                                            <h3 className="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-[#0b1c30]">Hiệu quả tin đăng</h3>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col">
                                        <span className="text-[12px] text-[#3d4947]">Tổng lượt xem tin</span>
                                        <span className="font-['Plus_Jakarta_Sans'] text-[24px] text-[#0b1c30] font-bold mt-1">
                                            {room.viewCount?.toLocaleString('vi-VN') || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}