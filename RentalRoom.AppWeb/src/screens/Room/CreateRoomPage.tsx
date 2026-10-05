import React, { useState, useEffect } from 'react';
// Thay thế Header/Footer bằng Sidebar của Chủ trọ
import LandlordSidebar from '../../Components/LandLordSidebar/LandlordSidebar';
import { createRoom, getCategories } from '../../Services/roomService';
import type { CreateRoomRequestDto } from '../../Dtos/Room/RoomDto';
import styles from './CreateRoomPage.module.css';

interface AmenityResponse {
  id: number;
  name: string;
}

interface CategoryResponse {
  id: number;
  name: string;
}

export default function CreateRoomPage() {
  const [form, setForm] = useState<CreateRoomRequestDto>({
    categoryId: 1,
    title: '',
    description: '',
    price: '',
    area: '',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Dịch Vọng Hậu',
    addressDetail: '',
    amenityIds: [],
  });

  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States quản lý API Tiện ích & Loại hình
  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);
        setApiError(null);

        // Gọi song song 2 API để tiết kiệm thời gian chờ
        const [amenitiesRes, categoriesData] = await Promise.all([
          fetch('https://localhost:7188/api/amenities'),
          getCategories()
        ]);

        if (!amenitiesRes.ok) throw new Error('Không thể tải danh sách tiện ích.');
        const amenitiesData = await amenitiesRes.json();

        setAmenities(amenitiesData);
        setCategories(categoriesData);

        // Tự động set categoryId mặc định là item đầu tiên từ DB nếu form chưa chọn
        if (categoriesData && categoriesData.length > 0) {
          setForm(prev => ({ ...prev, categoryId: categoriesData[0].id }));
        }

      } catch (err: any) {
        setApiError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (
    field: keyof CreateRoomRequestDto,
    value: string | number | number[],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (id: number) => {
    setForm((prev) => {
      const isSelected = prev.amenityIds.includes(id);
      return {
        ...prev,
        amenityIds: isSelected
          ? prev.amenityIds.filter((a) => a !== id)
          : [...prev.amenityIds, id],
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const result = await createRoom(form, images);
      alert('Tạo phòng thành công!');
      console.log('API response:', result);
      // TODO: Navigate về trang quản lý
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Lỗi kết nối đến server. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (id: number) => {
    switch (id) {
      case 1: return 'apartment';     // Chung cư mini / Studio
      case 2: return 'meeting_room';  // Khép kín
      case 3: return 'domain';        // Nguyên căn
      case 4: return 'group';         // Ở ghép
      default: return 'real_estate_agent'; // Icon mặc định
    }
  };

  return (
    // Lớp nền tổng của trang Chủ trọ
    <div className="bg-[#f8f9ff] font-['Be_Vietnam_Pro'] text-[#0b1c30] antialiased min-h-screen flex flex-col">

      {/* 1. Gọi thanh Sidebar bên trái */}
      <LandlordSidebar />

      {/* 2. Đẩy nội dung chính sang phải bằng class pl-64 */}
      <div className="pl-64 flex flex-col min-h-screen w-full">
        <main className="w-full flex-1 p-6 sm:p-8">

          <div className="max-w-[1200px] mx-auto w-full">
            {/* Header của form đăng tin */}
            <div className="flex items-center gap-2 mb-6 pb-2">
              <span className="material-symbols-outlined text-[32px] text-[#00685f]">post_add</span>
              <h1 className="text-[24px] sm:text-[28px] font-bold font-['Plus_Jakarta_Sans'] text-[#0b1c30]">
                Tạo tin đăng mới
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* CỘT TRÁI (FORM NHẬP LIỆU) */}
              <div className="lg:col-span-8 flex flex-col gap-6">

                {/* 1. THÔNG TIN CƠ BẢN */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                    <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">1</span>
                    <h2 className="text-[20px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">Thông tin cơ bản</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-semibold text-[#0b1c30]">Tiêu đề tin đăng <span className="text-[#ba1a1a]">*</span></label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border-none outline-none focus:ring-2 focus:ring-[#00685f]"
                        placeholder="Ví dụ: Phòng trọ khép kín ngõ 175 Xuân Thủy..."
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-semibold text-[#0b1c30]">Mô tả chi tiết <span className="text-[#ba1a1a]">*</span></label>
                      <textarea
                        required
                        rows={4}
                        value={form.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border-none outline-none focus:ring-2 focus:ring-[#00685f]"
                        placeholder="Mô tả các điểm nổi bật của phòng..."
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-semibold text-[#0b1c30]">Loại hình <span className="text-[#ba1a1a]">*</span></label>
                      {loadingData ? (
                        <p className="text-[13px] text-[#6d7a77] italic py-2">Đang tải loại hình...</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {categories.map(cat => (
                            <label
                              key={cat.id}
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all ${form.categoryId === cat.id ? 'border-[#00685f] bg-[#00685f]/5' : 'border-[#eaf1ff] hover:border-[#bcc9c6]'}`}
                            >
                              <input type="radio" name="category" className="sr-only" checked={form.categoryId === cat.id} onChange={() => handleChange('categoryId', cat.id)} />
                              <span className={`material-symbols-outlined text-[28px] ${form.categoryId === cat.id ? 'text-[#00685f]' : 'text-[#6d7a77]'}`}>
                                {getCategoryIcon(cat.id)}
                              </span>
                              <span className={`text-[14px] font-semibold text-center ${form.categoryId === cat.id ? 'text-[#00685f]' : 'text-[#3d4947]'}`}>
                                {cat.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. ĐỊA CHỈ */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                    <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">2</span>
                    <h2 className="text-[20px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">Địa chỉ khu vực</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-semibold text-[#0b1c30]">Quận / Huyện <span className="text-[#ba1a1a]">*</span></label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border-none outline-none focus:ring-2 focus:ring-[#00685f]"
                        value={form.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                      >
                        <option value="Quận Cầu Giấy">Quận Cầu Giấy</option>
                        <option value="Quận Đống Đa">Quận Đống Đa</option>
                        <option value="Quận Thanh Xuân">Quận Thanh Xuân</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-semibold text-[#0b1c30]">Phường / Xã <span className="text-[#ba1a1a]">*</span></label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border-none outline-none focus:ring-2 focus:ring-[#00685f]"
                        value={form.ward}
                        onChange={(e) => handleChange('ward', e.target.value)}
                      >
                        <option value="Phường Dịch Vọng Hậu">Phường Dịch Vọng Hậu</option>
                        <option value="Phường Quan Hoa">Phường Quan Hoa</option>
                        <option value="Phường Mai Dịch">Phường Mai Dịch</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-[#0b1c30]">Số nhà, ngõ ngách, tên đường <span className="text-[#ba1a1a]">*</span></label>
                    <input
                      type="text"
                      required
                      value={form.addressDetail}
                      onChange={(e) => handleChange('addressDetail', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border-none outline-none focus:ring-2 focus:ring-[#00685f]"
                      placeholder="Ví dụ: Số 36 Ngõ 175 Xuân Thủy"
                    />
                  </div>
                </div>

                {/* 3. GIÁ & DIỆN TÍCH */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                    <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">3</span>
                    <h2 className="text-[20px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">Giá thuê & Diện tích</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-semibold text-[#0b1c30]">Giá cho thuê (VNĐ/tháng) <span className="text-[#ba1a1a]">*</span></label>
                      <input
                        type="number"
                        required
                        value={form.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border-none outline-none focus:ring-2 focus:ring-[#00685f]"
                        placeholder="VD: 4500000"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-semibold text-[#0b1c30]">Diện tích (m²) <span className="text-[#ba1a1a]">*</span></label>
                      <input
                        type="number"
                        required
                        value={form.area}
                        onChange={(e) => handleChange('area', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border-none outline-none focus:ring-2 focus:ring-[#00685f]"
                        placeholder="VD: 32"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. TIỆN ÍCH TỪ API */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                    <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">4</span>
                    <h2 className="text-[20px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">Tiện ích có sẵn</h2>
                  </div>

                  {loadingData ? (
                    <p className="text-[14px] text-[#6d7a77] italic py-2">Đang tải dữ liệu...</p>
                  ) : apiError ? (
                    <p className="text-[14px] text-[#ba1a1a] py-2">Lỗi: {apiError}</p>
                  ) : amenities.length === 0 ? (
                    <p className="text-[14px] text-[#6d7a77] italic py-2">Chưa có tiện ích nào trong hệ thống.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {amenities.map((amenity) => (
                        <label key={amenity.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#eff4ff] cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f] accent-[#00685f]"
                            checked={form.amenityIds.includes(amenity.id)}
                            onChange={() => handleAmenityToggle(amenity.id)}
                          />
                          <span className="text-[14px] text-[#0b1c30]">{amenity.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. HÌNH ẢNH */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5eeff]">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#e5eeff] pb-4">
                    <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">5</span>
                    <h2 className="text-[20px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">Hình ảnh thực tế</h2>
                  </div>

                  <div className="relative border-2 border-dashed border-[#bcc9c6] bg-[#eff4ff]/50 hover:bg-[#eff4ff] rounded-xl p-8 flex flex-col items-center justify-center transition-colors text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <span className="material-symbols-outlined text-[36px] text-[#00685f] mb-2">cloud_upload</span>
                    <p className="text-[16px] font-semibold text-[#0b1c30]">
                      Kéo thả ảnh phòng vào đây hoặc <span className="text-[#00685f]">Chọn từ máy</span>
                    </p>
                    <p className="text-[12px] text-[#6d7a77] mt-1">Hỗ trợ định dạng JPG, PNG (Tối đa 10 ảnh)</p>
                  </div>

                  {images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-[14px] font-semibold text-[#0b1c30] mb-3">Ảnh đã chọn ({images.length})</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {images.map((img, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[#bcc9c6] group">
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`Preview ${index}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ba1a1a]"
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* CỘT PHẢI (PREVIEW & ACTION) */}
              <aside className="lg:col-span-4">
                {/* Đã xóa class sticky top-24 do không còn Header cố định, thay bằng top-6 cho gọn */}
                <div className="sticky top-6 flex flex-col gap-6">

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5eeff] flex flex-col gap-4">
                    <h3 className="text-[18px] font-bold text-[#0b1c30] flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                      <span className="material-symbols-outlined text-[#006398]">preview</span> Xem trước tin đăng
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[28px] font-bold text-[#ba1a1a] font-['Plus_Jakarta_Sans']">
                          {form.price ? `${(parseInt(form.price) / 1000000).toFixed(1)} Triệu` : 'Chưa nhập giá'}
                        </span>
                        {form.price && <span className="text-[#3d4947] text-[14px]">/ tháng</span>}
                      </div>

                      <span className="font-semibold text-[#0b1c30] text-[16px] line-clamp-2 leading-snug font-['Plus_Jakarta_Sans']">
                        {form.title || 'Tiêu đề tin đăng sẽ hiển thị ở đây...'}
                      </span>

                      <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-2 mt-2">
                        <span className="text-[13px] text-[#3d4947] flex items-center gap-1.5 line-clamp-1">
                          <span className="material-symbols-outlined text-[16px] text-[#00685f]">location_on</span>
                          {form.addressDetail ? `${form.addressDetail}, ` : ''}{form.ward}, {form.district}
                        </span>
                        <span className="text-[13px] text-[#3d4947] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#00685f]">square_foot</span>
                          Diện tích: {form.area ? `${form.area} m²` : 'Đang cập nhật'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5eeff] flex flex-col gap-4">
                    <h3 className="text-[16px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">Thông tin liên hệ (Của bạn)</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#006398] text-white flex items-center justify-center font-bold text-[20px] font-['Plus_Jakarta_Sans']">
                        C
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#0b1c30] flex items-center gap-1 font-['Plus_Jakarta_Sans']">
                          Chính chủ <span className="material-symbols-outlined text-[#006947] text-[16px]">verified</span>
                        </span>
                        <span className="text-[13px] text-[#6d7a77]">Số điện thoại: Hệ thống tự trích xuất</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#00685f] hover:bg-[#008378] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Plus_Jakarta_Sans']"
                  >
                    <span className="text-[16px]">{isSubmitting ? 'Hệ thống đang lưu...' : 'Xác nhận Đăng tin ngay'}</span>
                    {!isSubmitting && <span className="material-symbols-outlined text-[20px]">send</span>}
                  </button>

                </div>
              </aside>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}