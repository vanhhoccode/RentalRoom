import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import PropertyCard from '../../Components/PropertyCard/PropertyCard';
import { getRooms, getCategories } from '../../Services/roomService';
import { getFavorites, addFavorite, removeFavorite } from '../../Services/favoriteService';
import { RoomDto, RoomListResponseDto, RoomSearchFilter, defaultRoomSearchFilter } from '../../Dtos/Room/RoomDto';
import styles from './HomePage.module.css';

// Import Dữ liệu Tỉnh/Thành thực tế
import hanoiData from '../../Utils/hanoi-legacy-urban.json';

export interface CategoryResponse {
  id: number;
  name: string;
}

const PRICE_RANGES = [
  { label: "Tất cả mức giá", min: undefined, max: undefined },
  { label: "Dưới 2 triệu", min: undefined, max: 2000000 },
  { label: "Từ 2 - 3 triệu", min: 2000000, max: 3000000 },
  { label: "Từ 3 - 5 triệu", min: 3000000, max: 5000000 },
  { label: "Từ 5 - 7 triệu", min: 5000000, max: 7000000 },
  { label: "Trên 7 triệu", min: 7000000, max: undefined }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [filter, setFilter] = useState<RoomSearchFilter>(defaultRoomSearchFilter);
  const [priceSelectIdx, setPriceSelectIdx] = useState<string>("");

  // ===== STATE PHÂN TRANG =====
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State lưu danh sách ID phòng đã yêu thích
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Hàm load phòng dùng chung — nhận page để biết cần lấy trang nào
  const loadRooms = async (page: number, currentFilter: RoomSearchFilter) => {
    try {
      setLoading(true);
      setError(null);
      const data: RoomListResponseDto = await getRooms({ ...currentFilter, page, pageSize: 10 });
      setRooms(data.rooms);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setCurrentPage(data.page);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [data, categoriesData] = await Promise.all([
          getRooms({ ...defaultRoomSearchFilter, page: 1, pageSize: 10 }),
          getCategories()
        ]);

        setRooms(data.rooms);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        setCurrentPage(data.page);
        setCategories(categoriesData);

        // Lấy danh sách yêu thích nếu là TENANT
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (token && user?.roleCode === 'TENANT') {
          try {
            const favData = await getFavorites();
            setFavoriteIds(favData.map((f: any) => f.roomId));
          } catch (favErr) {
            console.error("Lỗi lấy danh sách yêu thích:", favErr);
          }
        }

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    await loadRooms(1, filter);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    loadRooms(page, filter);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const updateFilter = (field: keyof RoomSearchFilter, value: any) => {
    setFilter(prev => ({ ...prev, [field]: value }));
  };

  // Logic Cascading: Khi chọn Quận/Huyện mới thì phải Reset Phường/Xã
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    setFilter(prev => ({
      ...prev,
      district: newDistrict || undefined,
      ward: undefined // Reset Phường khi Quận thay đổi
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idxStr = e.target.value;
    setPriceSelectIdx(idxStr);

    if (!idxStr) {
      setFilter(prev => ({ ...prev, minPrice: undefined, maxPrice: undefined }));
      return;
    }

    const range = PRICE_RANGES[Number(idxStr)];
    setFilter(prev => ({ ...prev, minPrice: range.min, maxPrice: range.max }));
  };

  // Query Phường/Xã dựa vào Quận/Huyện đã chọn từ JSON thực tế
  const availableWards = filter.district
    ? hanoiData.districts.find(d => d.name === filter.district)?.wards || []
    : [];

  const handleToggleFavorite = async (roomId: number) => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token) {
      alert("Vui lòng đăng nhập để lưu tin phòng trọ.");
      navigate('/login');
      return;
    }
    if (user?.roleCode !== 'TENANT') {
      alert("Chức năng lưu tin chỉ dành cho Người thuê phòng.");
      return;
    }

    const isFav = favoriteIds.includes(roomId);
    try {
      if (isFav) {
        await removeFavorite(roomId);
        setFavoriteIds(prev => prev.filter(id => id !== roomId));
      } else {
        await addFavorite(roomId);
        setFavoriteIds(prev => [...prev, roomId]);
      }
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        navigate('/login');
      } else {
        alert(err.message || "Không thể thực hiện thao tác này.");
      }
    }
  };

  const handleHeaderSearch = (kw: string) => {
    const newFilter = { ...filter, keyword: kw || undefined };
    setFilter(newFilter);
    loadRooms(1, newFilter);
  };

  return (
    <div className={styles.pageContainer}>
      <Header onSearch={handleHeaderSearch} searchValue={filter.keyword || ''} />

      <main className="w-full flex flex-col">
        {/* HERO & BẢNG TÌM KIẾM */}
        <section className={styles.heroSection}>
          <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm mb-3">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">bolt</span>
                <span className="text-[11px] text-[#00685f] uppercase tracking-wider font-semibold">CẬP NHẬT TRẠNG THÁI PHÒNG NHANH & CHÍNH XÁC</span>
              </div>
              <h1 className="text-[32px] lg:text-[40px] font-bold text-[#0b1c30] tracking-tight mb-2">
                Tìm phòng trọ, căn hộ mini <span className="text-[#00685f]">nhanh & chính chủ</span>
              </h1>
              <p className="text-[16px] text-[#3d4947]">
                Trạng thái phòng luôn được cập nhật — Dễ dàng tìm phòng còn trống, tránh tin đã cho thuê.
              </p>
            </div>

            <div className={styles.searchConsole}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                <div className={`lg:col-span-5 ${styles.filterInputGroup}`}>
                  <span className="text-[11px] font-medium text-[#6d7a77] flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[15px] text-[#006398]">search</span> Tìm theo tên đường, trường ĐH...
                  </span>
                  <input
                    type="text"
                    placeholder="VD: Bách Khoa, Ngõ 10..."
                    className="bg-transparent text-[16px] font-semibold text-[#0b1c30] outline-none w-full"
                    value={filter.keyword || ''}
                    onChange={(e) => updateFilter('keyword', e.target.value)}
                  />
                </div>

                <div className={`lg:col-span-4 ${styles.filterInputGroup}`}>
                  <span className="text-[11px] font-medium text-[#6d7a77] flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[15px] text-[#00685f]">apartment</span> Loại hình
                  </span>
                  <select
                    className={styles.filterSelect}
                    value={filter.categoryId || ''}
                    onChange={(e) => updateFilter('categoryId', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Tất cả loại phòng</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`lg:col-span-3 ${styles.filterInputGroup}`}>
                  <span className="text-[11px] font-medium text-[#6d7a77] flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[15px] text-[#00685f]">payments</span> Mức giá
                  </span>
                  <select
                    className={styles.filterSelect}
                    value={priceSelectIdx}
                    onChange={handlePriceChange}
                  >
                    {PRICE_RANGES.map((range, idx) => (
                      <option key={idx} value={idx === 0 ? "" : idx}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`lg:col-span-4 ${styles.filterInputGroup}`}>
                  <span className="text-[11px] font-medium text-[#6d7a77] flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[15px] text-[#00685f]">location_on</span> Quận / Huyện
                  </span>
                  <select
                    className={styles.filterSelect}
                    value={filter.district || ''}
                    onChange={handleDistrictChange}
                  >
                    <option value="">Tất cả Quận/Huyện</option>
                    {hanoiData.districts.map(d => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className={`lg:col-span-4 ${styles.filterInputGroup} ${!filter.district ? 'opacity-60' : ''}`}>
                  <span className="text-[11px] font-medium text-[#6d7a77] flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[15px] text-[#00685f]">my_location</span> Phường / Xã
                  </span>
                  <select
                    className={styles.filterSelect}
                    value={filter.ward || ''}
                    onChange={(e) => updateFilter('ward', e.target.value || undefined)}
                    disabled={!filter.district}
                  >
                    <option value="">Tất cả Phường/Xã</option>
                    {availableWards.map(w => (
                      <option key={w.code} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-4 mt-1 lg:mt-0">
                  <button
                    onClick={handleSearch}
                    className="w-full flex items-center justify-center gap-2 bg-[#00685f] hover:bg-[#008378] text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all h-[52px]"
                  >
                    <span className="material-symbols-outlined text-[20px]">search</span>
                    <span>Tìm kiếm phòng</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* DANH SÁCH PHÒNG TỪ API */}
        <section className={styles.mainContentSection}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00685f] inline-block"></span>
                <span className="text-[12px] uppercase tracking-wider text-[#00685f] font-bold">Danh sách tuyển chọn</span>
              </div>
              <h2 className="text-[28px] font-bold text-[#0b1c30]">Phòng trọ & Căn hộ đang sẵn sàng</h2>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p className="font-semibold">Đang tải danh sách phòng từ server...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              Lỗi tải dữ liệu: {error}
            </div>
          ) : rooms.length === 0 ? (
            <div className={styles.emptyState}>
              <span className="material-symbols-outlined text-[48px] text-[#bcc9c6] mb-2">search_off</span>
              <p className="text-[16px] font-semibold text-[#0b1c30]">Không tìm thấy phòng nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className={styles.gridContainer}>
              {rooms.map((room) => {
                const formattedPrice = room.price
                  ? `${(room.price / 1_000_000).toFixed(1)} Triệu`
                  : 'Thỏa thuận';
                const statusStr: 'available' | 'rented' =
                  room.status === 'Available' ? 'available' : 'rented';

                const BASE_URL = 'https://localhost:7188';
                const fallbackImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKe9QZcDH0lzkTSl-nLSODpVJ8EdJxTrsAa7POpFxGCS2MFIBy7XkWLmaXTVm0N0936jWfvPGXZyUmhh1F40_c5rws4O1tBSZAx8rVewiODyByjDGm5MLjuADhkR5kxWNox82BYtGkcCEfI7y37qVtRIlt4P91YNvjTAtxB8v_e_mBS475x-9fa3QgEn0JB1auTj0BpK6h-3D6NHjUMLo5nlhnT09xouI2FujXPZVSqNPrC7DMoeqf';
                const imageUrl = room.imageUrl ? `${BASE_URL}${room.imageUrl}` : fallbackImage;

                return (
                  <PropertyCard
                    key={room.id}
                    id={room.id}
                    imageUrl={imageUrl}
                    title={room.title}
                    priceFormatted={formattedPrice}
                    area={room.area}
                    address={`${room.addressDetail ?? ''}, ${room.ward ?? ''}, ${room.district ?? ''}`}
                    status={statusStr}
                    schoolProximity={`Khu vực ${room.district ?? ''}`}
                    features={room.amenities || []}
                    photoCount={room.imageCount ? Number(room.imageCount) : 0}
                    landlordName="Chủ trọ xác thực"
                    verifiedHost={true}
                    variant="search"
                    isFavorite={favoriteIds.includes(Number(room.id))}
                    onToggleFavorite={() => handleToggleFavorite(Number(room.id))}
                  />
                );
              })}
            </div>
          )}

          {/* ===== PHÂN TRANG ===== */}
          {!loading && !error && totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '40px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}>
              {/* Nút Trang trước */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #d1dbd9',
                  background: currentPage === 1 ? '#f5f7f7' : '#fff',
                  color: currentPage === 1 ? '#aab8b5' : '#0b1c30',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ← Trang trước
              </button>

              {/* Các nút số trang */}
              {(() => {
                const pages: (number | '...')[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push('...');
                  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                    pages.push(i);
                  }
                  if (currentPage < totalPages - 2) pages.push('...');
                  pages.push(totalPages);
                }

                return pages.map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} style={{ padding: '0 4px', color: '#aab8b5', fontWeight: 600 }}>...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: currentPage === p ? '2px solid #00685f' : '1.5px solid #d1dbd9',
                        background: currentPage === p ? '#00685f' : '#fff',
                        color: currentPage === p ? '#fff' : '#0b1c30',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              {/* Nút Trang sau */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #d1dbd9',
                  background: currentPage === totalPages ? '#f5f7f7' : '#fff',
                  color: currentPage === totalPages ? '#aab8b5' : '#0b1c30',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Trang sau →
              </button>

              {/* Hiển thị thông tin tổng */}
              <span style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '13px',
                color: '#6d7a77',
                marginTop: '8px',
              }}>
                Trang {currentPage}/{totalPages} — Tổng {totalCount} phòng
              </span>
            </div>
          )}
        </section>

        {/* CÁC TIỆN ÍCH KHÁM PHÁ NHANH */}
        <section className={styles.discoverySection}>
          <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={styles.discoveryCard}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#00685f] text-[24px]">explore</span>
                  <h3 className="text-[20px] font-bold text-[#0b1c30]">Khu vực phòng trọ hot nhất</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-2 rounded-xl bg-[#eff4ff] text-[12px] font-semibold text-[#3d4947] cursor-pointer hover:bg-[#00685f] hover:text-white transition-colors">Quận Cầu Giấy</span>
                  <span className="px-3 py-2 rounded-xl bg-[#eff4ff] text-[12px] font-semibold text-[#3d4947] cursor-pointer hover:bg-[#00685f] hover:text-white transition-colors">Quận Đống Đa</span>
                  <span className="px-3 py-2 rounded-xl bg-[#eff4ff] text-[12px] font-semibold text-[#3d4947] cursor-pointer hover:bg-[#00685f] hover:text-white transition-colors">Quận Thanh Xuân</span>
                </div>
              </div>
              <div className={styles.discoveryCard}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#006398] text-[24px]">school</span>
                  <h3 className="text-[20px] font-bold text-[#0b1c30]">Tìm phòng gần Đại Học</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-2 rounded-xl bg-[#eff4ff] text-[12px] font-semibold text-[#3d4947] cursor-pointer hover:bg-[#006398] hover:text-white transition-colors">ĐH Bách Khoa</span>
                  <span className="px-3 py-2 rounded-xl bg-[#eff4ff] text-[12px] font-semibold text-[#3d4947] cursor-pointer hover:bg-[#006398] hover:text-white transition-colors">ĐH Quốc Gia</span>
                  <span className="px-3 py-2 rounded-xl bg-[#eff4ff] text-[12px] font-semibold text-[#3d4947] cursor-pointer hover:bg-[#006398] hover:text-white transition-colors">ĐH Kinh Tế Quốc Dân</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}