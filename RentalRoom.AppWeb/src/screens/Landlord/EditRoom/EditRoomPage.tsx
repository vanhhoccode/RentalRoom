import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LandlordSidebar from '../../../Components/LandLordSidebar/LandlordSidebar';
import { getCategories, updateRoom } from '../../../Services/roomService';
import type { UpdateRoomRequestDto } from '../../../Dtos/Room/RoomDto';

interface AmenityResponse { id: number; name: string; }
interface CategoryResponse { id: number; name: string; }

const BASE_URL = 'https://localhost:7188';

export default function EditRoomPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState<UpdateRoomRequestDto>({
        categoryId: 1, title: '', description: '', price: '', area: '', district: '', ward: '', addressDetail: '', amenityIds: [],
    });

    // State lưu URL ảnh cũ (chỉ để hiển thị, không gây CORS)
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // State lưu File ảnh mới nếu user muốn thay đổi
    const [images, setImages] = useState<File[]>([]);
    const [isImageChanged, setIsImageChanged] = useState(false);

    const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoadingData(true);

                const token = localStorage.getItem('accessToken');
                const [roomRes, amenitiesRes, categoriesData] = await Promise.all([
                    fetch(`${BASE_URL}/api/rooms/${id}`, {
                        headers: { 'Authorization': `Bearer ${token ?? ''}` }
                    }),
                    fetch(`${BASE_URL}/api/amenities`),
                    getCategories()
                ]);

                if (!roomRes.ok) throw new Error('Không tìm thấy dữ liệu phòng.');
                const roomData = await roomRes.json();

                if (roomData.status === 'Rented') {
                    alert('Không thể chỉnh sửa nội dung tin đăng đã cho thuê.');
                    navigate('/landlord/listings');
                    return;
                }

                setAmenities(await amenitiesRes.json());
                setCategories(categoriesData);

                setForm({
                    categoryId: roomData.categoryId || 1,
                    title: roomData.title,
                    description: roomData.description || '',
                    price: roomData.price,
                    area: roomData.area,
                    district: roomData.district,
                    ward: roomData.ward,
                    addressDetail: roomData.addressDetail,
                    amenityIds: roomData.amenities?.map((a: any) => a.id) || [],
                });

                // Chỉ lưu URL để hiển thị thẻ <img>
                if (roomData.images && roomData.images.length > 0) {
                    setExistingImages(roomData.images);
                }

            } catch (err: any) {
                setApiError(err.message || 'Lỗi kết nối máy chủ');
            } finally {
                setLoadingData(false);
            }
        };

        if (id) fetchInitialData();
    }, [id, navigate]);

    const handleChange = (field: keyof UpdateRoomRequestDto, value: string | number | number[]) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAmenityToggle = (amenityId: number) => {
        setForm(prev => ({
            ...prev,
            amenityIds: prev.amenityIds.includes(amenityId)
                ? prev.amenityIds.filter(id => id !== amenityId)
                : [...prev.amenityIds, amenityId],
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (isImageChanged && images.length === 0) {
            alert("Bạn đã chọn thay đổi ảnh, vui lòng upload ít nhất 1 ảnh mới.");
            return;
        }

        try {
            setIsSubmitting(true);
            await updateRoom(id as string, form, images, isImageChanged);

            alert('Cập nhật tin thành công. Tin đang chờ Admin duyệt lại.');
            navigate('/landlord/listings');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Lỗi kết nối đến server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingData) return <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center text-[#00685f]"><span className="material-symbols-outlined animate-spin text-[40px]">progress_activity</span></div>;
    if (apiError) return <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center text-[#ba1a1a]">{apiError}</div>;

    return (
        <div className="bg-[#f8f9ff] font-['Be_Vietnam_Pro'] text-[#0b1c30] antialiased min-h-screen flex flex-col">
            <LandlordSidebar />
            <div className="pl-64 flex flex-col min-h-screen w-full">
                <main className="w-full flex-1 p-6 sm:p-8">
                    <div className="max-w-[1200px] mx-auto w-full">

                        <div className="flex items-center gap-2 mb-6 pb-2">
                            <span className="material-symbols-outlined text-[32px] text-[#00685f]">edit_document</span>
                            <h1 className="text-[24px] sm:text-[28px] font-bold font-['Plus_Jakarta_Sans'] text-[#0b1c30]">
                                Chỉnh sửa tin đăng #{id}
                            </h1>
                        </div>

                        <div className="mb-6 bg-[#fff8e1] border border-[#ffc107] p-4 rounded-xl flex items-start gap-3 text-[#b28900]">
                            <span className="material-symbols-outlined mt-0.5">info</span>
                            <div>
                                <p className="font-bold font-['Plus_Jakarta_Sans'] text-[15px]">Lưu ý quan trọng</p>
                                <p className="text-[14px]">Sau khi chỉnh sửa thành công, tin đăng sẽ tự động chuyển sang trạng thái <strong>Chờ duyệt</strong> và cần Admin kiểm duyệt lại.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 flex flex-col gap-6">

                                {/* 1. THÔNG TIN CƠ BẢN */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                                    <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                                        <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">1</span>
                                        <h2 className="text-[20px] font-bold text-[#0b1c30]">Thông tin cơ bản</h2>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[14px] font-semibold">Tiêu đề tin đăng <span className="text-[#ba1a1a]">*</span></label>
                                            <input type="text" required value={form.title} onChange={e => handleChange('title', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border-none outline-none focus:ring-2 focus:ring-[#00685f]" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[14px] font-semibold">Mô tả chi tiết <span className="text-[#ba1a1a]">*</span></label>
                                            <textarea required rows={4} value={form.description} onChange={e => handleChange('description', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border-none outline-none focus:ring-2 focus:ring-[#00685f]" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[14px] font-semibold">Loại hình <span className="text-[#ba1a1a]">*</span></label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {categories.map(cat => (
                                                    <label key={cat.id} className={`flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all ${form.categoryId === cat.id ? 'border-[#00685f] bg-[#00685f]/5' : 'border-[#eaf1ff]'}`}>
                                                        <input type="radio" name="category" className="sr-only" checked={form.categoryId === cat.id} onChange={() => handleChange('categoryId', cat.id)} />
                                                        <span className={`text-[14px] font-semibold text-center ${form.categoryId === cat.id ? 'text-[#00685f]' : 'text-[#3d4947]'}`}>{cat.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. ĐỊA CHỈ */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                                    <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                                        <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">2</span>
                                        <h2 className="text-[20px] font-bold text-[#0b1c30]">Địa chỉ khu vực</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[14px] font-semibold">Quận / Huyện</label>
                                            <select value={form.district} onChange={e => handleChange('district', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] outline-none">
                                                <option value="Quận Cầu Giấy">Quận Cầu Giấy</option><option value="Quận Đống Đa">Quận Đống Đa</option><option value="Quận Thanh Xuân">Quận Thanh Xuân</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[14px] font-semibold">Phường / Xã</label>
                                            <select value={form.ward} onChange={e => handleChange('ward', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] outline-none">
                                                <option value="Phường Dịch Vọng Hậu">Phường Dịch Vọng Hậu</option><option value="Phường Mai Dịch">Phường Mai Dịch</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[14px] font-semibold">Số nhà, đường</label>
                                        <input type="text" required value={form.addressDetail} onChange={e => handleChange('addressDetail', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] outline-none" />
                                    </div>
                                </div>

                                {/* 3. GIÁ & DIỆN TÍCH */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                                    <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                                        <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">3</span>
                                        <h2 className="text-[20px] font-bold text-[#0b1c30]">Giá thuê & Diện tích</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[14px] font-semibold">Giá (VNĐ/tháng)</label>
                                            <input type="number" required value={form.price} onChange={e => handleChange('price', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] outline-none" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[14px] font-semibold">Diện tích (m²)</label>
                                            <input type="number" required value={form.area} onChange={e => handleChange('area', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] outline-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. TIỆN ÍCH */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                                    <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                                        <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">4</span>
                                        <h2 className="text-[20px] font-bold text-[#0b1c30]">Tiện ích</h2>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {amenities.map(amenity => (
                                            <label key={amenity.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#eff4ff] cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 rounded text-[#00685f]" checked={form.amenityIds.includes(amenity.id)} onChange={() => handleAmenityToggle(amenity.id)} />
                                                <span className="text-[14px]">{amenity.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* 5. HÌNH ẢNH (UX Mới - Không CORS) */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                                    <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                                        <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">5</span>
                                        <h2 className="text-[20px] font-bold text-[#0b1c30]">Hình ảnh thực tế</h2>
                                    </div>

                                    {!isImageChanged ? (
                                        // Trạng thái 1: Giữ nguyên ảnh cũ (Chỉ hiển thị, không lỗi CORS)
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[14px] text-[#3d4947] font-semibold">Bộ ảnh hiện tại ({existingImages.length} ảnh)</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsImageChanged(true)}
                                                    className="px-4 py-2 bg-[#eff4ff] text-[#00685f] text-[14px] font-semibold rounded-xl hover:bg-[#dce9ff] transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px] align-middle mr-1">imagesmode</span>
                                                    Thay đổi toàn bộ ảnh
                                                </button>
                                            </div>
                                            {existingImages.length > 0 ? (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                    {existingImages.map((imgUrl, idx) => (
                                                        <img key={idx} src={imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`} alt="old" className="w-full aspect-square object-cover rounded-lg border border-[#bcc9c6]" />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[13px] text-[#6d7a77] italic">Tin đăng này hiện chưa có ảnh.</p>
                                            )}
                                        </div>
                                    ) : (
                                        // Trạng thái 2: Xóa ảnh cũ, Upload bộ ảnh mới
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[14px] text-[#b28900] font-semibold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[18px]">warning</span> Đang cập nhật bộ ảnh mới...
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsImageChanged(false); setImages([]); }}
                                                    className="px-4 py-2 bg-[#ffdad6] text-[#ba1a1a] text-[14px] font-semibold rounded-xl hover:bg-[#ffb4ab] transition-colors"
                                                >
                                                    Hủy thay đổi ảnh
                                                </button>
                                            </div>

                                            <div className="relative border-2 border-dashed border-[#bcc9c6] bg-[#eff4ff]/50 hover:bg-[#eff4ff] rounded-xl p-8 flex flex-col items-center justify-center transition-colors text-center mb-4">
                                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                <span className="material-symbols-outlined text-[36px] text-[#00685f] mb-2">cloud_upload</span>
                                                <p className="text-[16px] font-semibold text-[#0b1c30]">Kéo thả ảnh vào đây hoặc <span className="text-[#00685f]">Chọn từ máy</span></p>
                                            </div>

                                            {images.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-[14px] font-semibold text-[#0b1c30] mb-3">Bộ ảnh mới sẽ lưu ({images.length})</h4>
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                        {images.map((file, idx) => (
                                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#bcc9c6] group">
                                                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                                                <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ba1a1a]">
                                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* ACTION SIDEBAR */}
                            <aside className="lg:col-span-4">
                                <div className="sticky top-6 flex flex-col gap-6">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5eeff]">
                                        <h3 className="text-[18px] font-bold text-[#0b1c30] mb-4">Xác nhận cập nhật</h3>
                                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#00685f] hover:bg-[#008378] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                                            {!isSubmitting && <span className="material-symbols-outlined text-[20px]">save</span>}
                                        </button>
                                        <button type="button" onClick={() => navigate('/landlord/listings')} className="w-full mt-3 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] py-3 rounded-xl font-semibold transition-all">
                                            Hủy bỏ
                                        </button>
                                    </div>
                                </div>
                            </aside>

                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}