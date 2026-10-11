import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LandlordSidebar from '../../../Components/LandLordSidebar/LandlordSidebar';
import ListingRow, { RoomData } from '../../../Components/ListingRow/ListingRow';
import { getMyRooms, deleteRoom, changeRoomStatus } from '../../../Services/roomService';
import styles from './MyListingsPage.module.css';

const API_BASE_URL = 'https://localhost:7188';
const ITEMS_PER_PAGE = 5;

export default function MyListingsPage() {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('Newest');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setIsLoading(true);
            const data = await getMyRooms();
            const formattedData = data.map((room: any) => ({
                ...room,
                imageUrl: room.imageUrl
                    ? (room.imageUrl.startsWith('http') ? room.imageUrl : `${API_BASE_URL}${room.imageUrl}`)
                    : '/placeholder-room.jpg'
            }));
            setRooms(formattedData);
        } catch (err: any) {
            setError(err.message || 'Lỗi tải danh sách phòng.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- 1. Tính toán KPIs bao gồm Rejected và Expired ---
    const summary = useMemo(() => {
        return {
            total: rooms.length,
            pending: rooms.filter(r => r.status === 'Pending').length,
            available: rooms.filter(r => r.status === 'Available').length,
            rented: rooms.filter(r => r.status === 'Rented').length,
            rejected: rooms.filter(r => r.status === 'Rejected').length,
            expired: rooms.filter(r => r.status === 'Expired').length,
        };
    }, [rooms]);

    // --- 2. Lọc & Sắp xếp & Phân trang ---
    const filteredAndSortedRooms = useMemo(() => {
        let result = [...rooms];

        // Lọc theo Status
        if (statusFilter !== 'All') {
            result = result.filter(r => r.status === statusFilter);
        }

        // Lọc theo Search Term
        if (searchTerm.trim() !== '') {
            result = result.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Sắp xếp theo Thời gian (Mới nhất / Cũ nhất)
        result.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            if (sortOrder === 'Newest') {
                return timeB - timeA; // Giảm dần
            } else {
                return timeA - timeB; // Tăng dần
            }
        });

        return result;
    }, [rooms, statusFilter, searchTerm, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedRooms.length / ITEMS_PER_PAGE);
    const currentData = filteredAndSortedRooms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page khi filter hoặc sort thay đổi
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortOrder]);

    // --- 3. Handlers ---
    const handleView = (id: string | number) => navigate(`/landlord/listings/${id}`);

    const handleEdit = (id: string | number) => {
        const room = rooms.find(r => r.id === id);
        if (room?.status === 'Rented') {
            alert('Không thể chỉnh sửa tin của phòng đã cho thuê.');
            return;
        }
        navigate(`/landlord/edit/${id}`);
    };

    const handleDelete = async (id: string | number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) {
            try {
                await deleteRoom(id);
                setRooms(prev => prev.filter(r => r.id !== id));
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const handleToggleStatus = async (id: string | number) => {
        // Tìm phòng, tránh lỗi nếu id giữa API và frontend khác kiểu dữ liệu
        const room = rooms.find(r => String(r.id) === String(id));
        if (!room) {
            alert('Không tìm thấy tin đăng phòng trọ.');
            return;
        }
        // 1. Tin đang chờ duyệt
        if (room.status === 'Pending') {
            alert(
                'Tin đang chờ duyệt, bạn không thể đổi trạng thái. ' +
                'Vui lòng đợi Admin xử lý.'
            );
            return;
        }
        // 2. Phòng còn trống -> Đã cho thuê
        if (room.status === 'Available') {
            const confirmed = window.confirm(
                'Xác nhận phòng này đã có người thuê? ' +
                'Trạng thái sẽ chuyển thành "Đã cho thuê".'
            );
            if (!confirmed) return;
            try {
                await changeRoomStatus(id, 'Rented');

                setRooms(prev =>
                    prev.map(r =>
                        String(r.id) === String(id)
                            ? { ...r, status: 'Rented' }
                            : r
                    )
                );
                alert('Đã cập nhật phòng sang trạng thái Đã cho thuê.');
            } catch (err: any) {
                alert(
                    err?.message ||
                    'Không thể cập nhật trạng thái phòng. Vui lòng thử lại.'
                );
            }
            return;
        }
        // 3. Đã cho thuê -> Còn trống
        if (room.status === 'Rented') {
            const confirmed = window.confirm(
                'Xác nhận người thuê đã chuyển đi và phòng hiện đã trống? ' +
                'Trạng thái sẽ chuyển về "Còn trống" và tin đăng có thể ' +
                'hiển thị trở lại cho người tìm phòng.'
            );
            if (!confirmed) return;
            try {
                await changeRoomStatus(id, 'Available');
                setRooms(prev =>
                    prev.map(r =>
                        String(r.id) === String(id)
                            ? { ...r, status: 'Available' }
                            : r
                    )
                );
                alert('Đã cập nhật phòng về trạng thái Còn trống.');
            } catch (err: any) {
                alert(
                    err?.message ||
                    'Không thể cập nhật trạng thái phòng. Vui lòng thử lại.'
                );
            }
            return;
        }
        // 4. Tin bị từ chối hoặc hết hạn
        if (room.status === 'Rejected' || room.status === 'Expired') {
            alert(
                'Không thể trực tiếp đổi trạng thái tin đã bị từ chối ' +
                'hoặc hết hạn. Vui lòng chỉnh sửa tin và gửi Admin duyệt lại.'
            );
            return;
        }
        // 5. Trạng thái ngoài nghiệp vụ được hỗ trợ
        alert('Trạng thái phòng không hợp lệ hoặc chưa được hỗ trợ.');
    };

    return (
        <div className={styles.pageWrapper}>
            <LandlordSidebar />

            <div className={styles.mainContent}>
                <main className={styles.innerContainer}>

                    {/* Top Utilities */}
                    <div className={styles.topUtils}>
                        <div className={styles.breadcrumb}>
                            <span className="material-symbols-outlined text-[16px]">domain</span>
                            <span>Chủ trọ</span>
                            <span className="text-[#bcc9c6]">/</span>
                            <span className="font-semibold text-[#00685f]">Tin của tôi</span>
                        </div>
                        <div className={styles.actionGroup}>
                            <button className={styles.btnOutline} onClick={() => alert('Đang xuất CSV...')}>
                                <span className="material-symbols-outlined text-[18px] text-[#006398]">file_download</span>
                                Xuất danh sách (CSV)
                            </button>
                            <button className={styles.btnPrimary} onClick={() => navigate('/create-room')}>
                                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                Đăng tin mới
                            </button>
                        </div>
                    </div>

                    {/* Header */}
                    <div className={styles.headerRow}>
                        <div className={styles.titleGroup}>
                            <h1 className={styles.pageTitle}>Tin đăng của tôi</h1>
                            <span className={styles.countBadge}>{summary.total} phòng trọ</span>
                        </div>
                        <p className={styles.pageDesc}>
                            Quản lý hiển thị, trạng thái thuê và theo dõi lưu lượng tương tác khách hàng.
                        </p>
                    </div>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">

                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#eaf1ff] flex flex-col items-start gap-1">
                            <div className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#006398] flex items-center justify-center mb-1">
                                <span className="material-symbols-outlined text-[18px]">apartment</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#6d7a77] uppercase tracking-wide">Tổng phòng</span>
                            <span className="text-[20px] font-bold text-[#0b1c30]">{summary.total}</span>
                        </div>

                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#eaf1ff] flex flex-col items-start gap-1">
                            <div className="w-8 h-8 rounded-full bg-[#dcfce7] text-[#065f46] flex items-center justify-center mb-1">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#6d7a77] uppercase tracking-wide">Có sẵn</span>
                            <span className="text-[20px] font-bold text-[#0b1c30]">{summary.available}</span>
                        </div>

                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#eaf1ff] flex flex-col items-start gap-1">
                            <div className="w-8 h-8 rounded-full bg-[#cce5ff] text-[#006398] flex items-center justify-center mb-1">
                                <span className="material-symbols-outlined text-[18px]">key</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#6d7a77] uppercase tracking-wide">Đã cho thuê</span>
                            <span className="text-[20px] font-bold text-[#0b1c30]">{summary.rented}</span>
                        </div>

                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#eaf1ff] flex flex-col items-start gap-1">
                            <div className="w-8 h-8 rounded-full bg-[#fef3c7] text-[#92400e] flex items-center justify-center mb-1">
                                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#6d7a77] uppercase tracking-wide">Chờ duyệt</span>
                            <span className="text-[20px] font-bold text-[#0b1c30]">{summary.pending}</span>
                        </div>

                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#eaf1ff] flex flex-col items-start gap-1">
                            <div className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center mb-1">
                                <span className="material-symbols-outlined text-[18px]">block</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#6d7a77] uppercase tracking-wide">Bị từ chối</span>
                            <span className="text-[20px] font-bold text-[#0b1c30]">{summary.rejected}</span>
                        </div>

                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#eaf1ff] flex flex-col items-start gap-1">
                            <div className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#475569] flex items-center justify-center mb-1">
                                <span className="material-symbols-outlined text-[18px]">timer_off</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#6d7a77] uppercase tracking-wide">Hết hạn</span>
                            <span className="text-[20px] font-bold text-[#0b1c30]">{summary.expired}</span>
                        </div>

                    </div>

                    {/* Filter Bar */}
                    <div className={styles.filterBar}>
                        <div className={styles.searchBox}>
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7a77]">search</span>
                            <input
                                type="text"
                                placeholder="Tìm theo Tiêu đề, Mã phòng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 items-center flex-1">
                            {[
                                { status: 'All', label: 'Tất cả', count: summary.total },
                                { status: 'Available', label: 'Có sẵn', count: summary.available },
                                { status: 'Rented', label: 'Đã cho thuê', count: summary.rented },
                                { status: 'Pending', label: 'Chờ duyệt', count: summary.pending },
                                { status: 'Rejected', label: 'Bị từ chối', count: summary.rejected },
                                { status: 'Expired', label: 'Hết hạn', count: summary.expired },
                            ].map(item => (
                                <button
                                    key={item.status}
                                    onClick={() => setStatusFilter(item.status)}
                                    className={`${styles.tabBtn} ${statusFilter === item.status ? styles.tabActive : styles.tabInactive} whitespace-nowrap`}
                                >
                                    {item.label} ({item.count})
                                </button>
                            ))}
                        </div>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="bg-white border border-[#outline-variant]/30 rounded-xl px-3 py-2 text-[13px] font-semibold text-[#0b1c30] outline-none hover:border-[#00685f] focus:border-[#00685f] cursor-pointer shadow-sm ml-auto shrink-0 transition-colors"
                        >
                            <option value="Newest">Mới nhất trước</option>
                            <option value="Oldest">Cũ nhất trước</option>
                        </select>
                    </div>

                    {/* Room List & States */}
                    <div className={styles.listContainer}>
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-[#6d7a77] bg-white rounded-2xl shadow-sm border border-[#e5eeff]">
                                <span className="material-symbols-outlined text-[40px] animate-spin">progress_activity</span>
                                <p className="mt-4 font-semibold">Đang tải danh sách phòng...</p>
                            </div>
                        ) : error ? (
                            <div className="py-20 flex flex-col items-center justify-center text-[#ba1a1a] bg-white rounded-2xl shadow-sm border border-[#e5eeff]">
                                <span className="material-symbols-outlined text-[48px]">error</span>
                                <p className="mt-4 font-semibold">{error}</p>
                                <button onClick={fetchRooms} className="mt-4 underline">Tải lại</button>
                            </div>
                        ) : filteredAndSortedRooms.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#e5eeff] shadow-sm">
                                <span className="material-symbols-outlined text-[64px] text-[#bcc9c6]">inbox</span>
                                <h3 className="text-[18px] font-bold text-[#0b1c30] mt-4">Không có tin đăng nào</h3>
                                <p className="text-[#6d7a77] mt-1 text-center">
                                    {searchTerm || statusFilter !== 'All'
                                        ? 'Không tìm thấy phòng phù hợp với bộ lọc hiện tại.'
                                        : 'Bạn chưa tạo tin đăng nào.'}
                                </p>
                                {statusFilter === 'All' && !searchTerm && (
                                    <button onClick={() => navigate('/create-room')} className={styles.btnPrimary + " mt-6"}>
                                        + Đăng tin đầu tiên
                                    </button>
                                )}
                            </div>
                        ) : (
                            currentData.map(room => (
                                <ListingRow
                                    key={room.id}
                                    room={room}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleStatus={handleToggleStatus}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <div className={styles.pageInfo}>
                                Hiển thị <span className="font-semibold text-[#0b1c30]">{((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedRooms.length)}</span> trên tổng số <span className="font-semibold text-[#0b1c30]">{filteredAndSortedRooms.length}</span> phòng
                            </div>
                            <div className={styles.pageControls}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`${styles.pageBtn} ${currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtnInactive}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className={`${styles.pageBtn} ${currentPage === num ? styles.pageBtnActive : styles.pageBtnInactive}`}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`${styles.pageBtn} ${currentPage === totalPages ? styles.pageBtnDisabled : styles.pageBtnInactive}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Support Banner */}
                    <div className={styles.supportBanner}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#00685f]/10 flex items-center justify-center text-[#00685f] shrink-0">
                                <span className="material-symbols-outlined text-[22px]">verified_user</span>
                            </div>
                            <div>
                                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#0b1c30]">Cần hỗ trợ đẩy tin hoặc xác thực phòng chính chủ?</h4>
                                <p className="text-[13px] text-[#3d4947] mt-0.5">
                                    Tin đăng có nhãn <span className="font-semibold text-[#006947]">Chính chủ TroTot</span> nhận được tương tác gấp 3 lần so với tin thường.
                                </p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white text-[#00685f] font-semibold text-[13px] rounded-xl shadow-sm border border-[#e5eeff] hover:bg-[#dce9ff] transition-colors whitespace-nowrap">
                            Liên hệ hỗ trợ viên
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}