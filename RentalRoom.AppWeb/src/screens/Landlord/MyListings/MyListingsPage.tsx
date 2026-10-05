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

    // --- 1. Tính toán KPIs ---
    const summary = useMemo(() => {
        return {
            total: rooms.length,
            pending: rooms.filter(r => r.status === 'Pending').length,
            available: rooms.filter(r => r.status === 'Available').length,
            rented: rooms.filter(r => r.status === 'Rented').length,
        };
    }, [rooms]);

    // --- 2. Lọc & Sắp xếp & Phân trang ---
    const filteredAndSortedRooms = useMemo(() => {
        let result = [...rooms];

        if (statusFilter !== 'All') {
            result = result.filter(r => r.status === statusFilter);
        }

        if (searchTerm.trim() !== '') {
            result = result.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // result.sort((a, b) => {
        //     const dateA = new Date(a.createdAt || a.date).getTime();
        //     const dateB = new Date(b.createdAt || b.date).getTime();
        //     return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
        // });

        return result;
    }, [rooms, statusFilter, searchTerm, sortOrder]);

    console.log("Danh sách phòng sau khi lọc:", filteredAndSortedRooms);
    const totalPages = Math.ceil(filteredAndSortedRooms.length / ITEMS_PER_PAGE);
    const currentData = filteredAndSortedRooms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page khi filter thay đổi
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
        const room = rooms.find(r => r.id === id);
        if (!room) return;
        if (room.status === 'Pending') {
            alert('Tin đang chờ duyệt, bạn không thể đổi trạng thái.');
            return;
        }
        if (room.status === 'Available') {
            if (window.confirm('Xác nhận phòng này đã được cho thuê? Trạng thái sẽ chuyển thành "Đã cho thuê".')) {
                try {
                    await changeRoomStatus(id, 'Rented');
                    setRooms(prev => prev.map(r => r.id === id ? { ...r, status: 'Rented' } : r));
                } catch (err: any) {
                    alert(err.message);
                }
            }
        } else if (room.status === 'Rented') {
            alert('Chỉ Admin hoặc Hệ thống mới có thể mở lại tin "Đã cho thuê". Vui lòng liên hệ BQT.');
        }
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
                    <div className={styles.kpiGrid}>
                        <div className={styles.kpiCard}>
                            <div className={styles.kpiHeader}>
                                <div className={`${styles.kpiIconWrapper} ${styles.iconTotal}`}>
                                    <span className="material-symbols-outlined text-[24px]">apartment</span>
                                </div>
                                <span className={`${styles.kpiBadge} ${styles.badgeTotal}`}>
                                    Cập nhật liên tục
                                </span>
                            </div>
                            <div>
                                <div className={styles.kpiLabel}>Tổng số phòng</div>
                                <div className={styles.kpiValue}>{summary.total} <span className={styles.kpiSub}>phòng</span></div>
                            </div>
                        </div>

                        <div className={styles.kpiCard}>
                            <div className={styles.kpiHeader}>
                                <div className={`${styles.kpiIconWrapper} ${styles.iconAvailable}`}>
                                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                </div>
                                <span className={`${styles.kpiBadge} ${styles.badgeAvailable}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#006947] animate-pulse"></span> Sẵn sàng đón khách
                                </span>
                            </div>
                            <div>
                                <div className={styles.kpiLabel}>Đang cho thuê (Available)</div>
                                <div className={styles.kpiValue}>{summary.available} <span className={`${styles.kpiSub} text-[#006947] font-semibold`}>đang mở</span></div>
                            </div>
                        </div>

                        <div className={styles.kpiCard}>
                            <div className={styles.kpiHeader}>
                                <div className={`${styles.kpiIconWrapper} ${styles.iconRented}`}>
                                    <span className="material-symbols-outlined text-[24px]">key</span>
                                </div>
                                <span className={`${styles.kpiBadge} ${styles.badgeRented}`}>
                                    Đã chốt hợp đồng
                                </span>
                            </div>
                            <div>
                                <div className={styles.kpiLabel}>Đã cho thuê (Rented)</div>
                                <div className={styles.kpiValue}>{summary.rented} <span className={styles.kpiSub}>phòng kín</span></div>
                            </div>
                        </div>

                        <div className={styles.kpiCard}>
                            <div className={styles.kpiHeader}>
                                <div className={`${styles.kpiIconWrapper} ${styles.iconPending}`}>
                                    <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
                                </div>
                                <span className={`${styles.kpiBadge} ${styles.badgePending}`}>
                                    BQT đang duyệt hồ sơ
                                </span>
                            </div>
                            <div>
                                <div className={styles.kpiLabel}>Chờ duyệt (Pending)</div>
                                <div className={styles.kpiValue}>{summary.pending} <span className={`${styles.kpiSub} text-[#ba1a1a] font-semibold`}>tin chờ</span></div>
                            </div>
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
                        <div className={styles.filterTabs}>
                            {['All', 'Available', 'Rented', 'Pending'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`${styles.tabBtn} ${statusFilter === status ? styles.tabActive : styles.tabInactive}`}
                                >
                                    {status === 'All' ? `Tất cả (${summary.total})` :
                                        status === 'Available' ? `Đang cho thuê (${summary.available})` :
                                            status === 'Rented' ? `Đã cho thuê (${summary.rented})` :
                                                `Chờ duyệt (${summary.pending})`}
                                </button>
                            ))}
                        </div>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className={styles.sortSelect}
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