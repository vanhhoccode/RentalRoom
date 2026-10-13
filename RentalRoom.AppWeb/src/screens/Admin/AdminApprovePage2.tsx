import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../Admin/AdminLayout/AdminLayout'; // Đảm bảo đường dẫn này đúng
import styles from './AdminApprovePage.module.css';
import { getPendingRooms, approveRoom, rejectRoom } from '../../Services/adminService';

const BASE_URL = 'https://localhost:7188';
const FALLBACK_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKe9QZcDH0lzkTSl-nLSODpVJ8EdJxTrsAa7POpFxGCS2MFIBy7XkWLmaXTVm0N0936jWfvPGXZyUmhh1F40_c5rws4O1tBSZAx8rVewiODyByjDGm5MLjuADhkR5kxWNox82BYtGkcCEfI7y37qVtRIlt4P91YNvjTAtxB8v_e_mBS475x-9fa3QgEn0JB1auTj0BpK6h-3D6NHjUMLo5nlhnT09xouI2FujXPZVSqNPrC7DMoeqf';

export default function AdminApprovePage2() {
    const navigate = useNavigate();

    // Data States
    const [pendingRooms, setPendingRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // UI States
    const [activeId, setActiveId] = useState<number | null>(null);
    const [modalConfig, setModalConfig] = useState<{ show: boolean, type: 'approve' | 'reject', room: any | null }>({ show: false, type: 'approve', room: null });
    const [toast, setToast] = useState<{ show: boolean, title: string, desc: string, isError: boolean }>({ show: false, title: '', desc: '', isError: false });

    // Form States
    const [rejectReason, setRejectReason] = useState('');

    const activeRoom = pendingRooms.find(r => r.id === activeId) || (pendingRooms.length > 0 ? pendingRooms[0] : null);

    // Load Data
    useEffect(() => {
        // [CÓ THỂ MỞ KHÓA KHI CHẠY THỰC TẾ]
        /*
        const token = localStorage.getItem('accessToken');
        const user = JSON.parse(localStorage.getItem('user') || 'null');

        if (!token) {
            alert("Vui lòng đăng nhập.");
            navigate('/login');
            return;
        }
        if (user?.roleCode !== 'ADMIN') {
            alert("Chỉ Admin mới có quyền truy cập trang này.");
            navigate('/');
            return;
        }
        */
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await getPendingRooms();
            setPendingRooms(data);
            if (data.length > 0) setActiveId(data[0].id);
            else setActiveId(null);
        } catch (err: any) {
            setErrorMsg(err.message || 'Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title: string, desc: string, isError = false) => {
        setToast({ show: true, title, desc, isError });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    // API Actions
    const handleExecuteAction = async () => {
        const { type, room } = modalConfig;
        if (!room) return;

        try {
            if (type === 'approve') {
                await approveRoom(room.id);
                showToast('Duyệt thành công', `Tin đăng #TT-${room.id} đã chuyển sang trạng thái Available.`);
            } else {
                if (!rejectReason.trim()) {
                    alert("Vui lòng nhập lý do từ chối để thông báo cho chủ trọ!");
                    return;
                }
                await rejectRoom(room.id, rejectReason);
                showToast('Từ chối thành công', `Tin #TT-${room.id} đã bị từ chối.`, true);
            }

            // Update UI
            const newList = pendingRooms.filter(r => r.id !== room.id);
            setPendingRooms(newList);

            if (activeId === room.id) {
                setActiveId(newList.length > 0 ? newList[0].id : null);
            }

            // Reset
            setModalConfig({ show: false, type: 'approve', room: null });
            setRejectReason('');

        } catch (err: any) {
            alert(err.message || "Có lỗi xảy ra trong quá trình xử lý.");
        }
    };

    const formatPrice = (price: number) => price ? `${(price / 1000000).toFixed(1)} tr` : 'Thỏa thuận';

    return (
        <AdminLayout>
            <div className={styles.pageContainer}>
                <div className={styles.mainWrapper}>
                    {/* Top Banner & Breadcrumb */}
                    <div className={styles.topBanner}>
                        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-3">
                            <div className={styles.breadcrumb}>
                                <span className="material-symbols-outlined text-[16px]">home</span>
                                <span>/</span>
                                <span>Hệ thống quản lý</span>
                                <span>/</span>
                                <span className="font-bold text-[#0b1c30]">Duyệt tin đăng</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contentContainer}>
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <h1 className={styles.headerTitle}>Kiểm duyệt tin đăng</h1>
                                <span className={styles.badgePending}>Queue #HàNội</span>
                            </div>
                            <button className={styles.btnRefresh} onClick={fetchData}>
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                Làm mới dữ liệu
                            </button>
                        </div>

                        {loading && <p className="text-[#3d4947] font-semibold italic mb-4">Đang tải danh sách chờ duyệt...</p>}
                        {errorMsg && <div className="bg-[#ffdad6] text-[#93000a] p-4 rounded-xl mb-4">{errorMsg}</div>}

                        {/* Grid Chia Bố Cục Master-Detail */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                            {/* CỘT TRÁI: Bảng Danh Sách */}
                            <div className="lg:col-span-7 xl:col-span-8">
                                <div className={styles.tableContainer}>
                                    <table className="w-full text-left">
                                        <thead className={styles.tableHeader}>
                                            <tr>
                                                <th className="py-3 px-4 font-semibold">Mã tin / Trạng thái</th>
                                                <th className="py-3 px-4 font-semibold">Thông tin phòng</th>
                                                <th className="py-3 px-4 font-semibold">Giá / Diện tích</th>
                                                <th className="py-3 px-4 font-semibold text-center">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingRooms.length === 0 && !loading && !errorMsg ? (
                                                <tr><td colSpan={4} className="p-8 text-center text-[#6d7a77]">Hàng chờ trống. Tuyệt vời!</td></tr>
                                            ) : (
                                                pendingRooms.map(room => (
                                                    <tr
                                                        key={room.id}
                                                        className={`${styles.tableRow} ${activeId === room.id ? styles.tableRowActive : ''}`}
                                                        onClick={() => setActiveId(room.id)}
                                                    >
                                                        <td className="py-3 px-4 align-top">
                                                            <div className="font-bold text-[#00685f]">#TT-{room.id}</div>
                                                            <div className="text-[11px] text-[#6d7a77] mt-1 text-center bg-[#ffdad6] text-[#93000a] rounded-full w-max px-2 py-0.5 font-bold">Chờ duyệt</div>
                                                        </td>
                                                        <td className="py-3 px-4 align-top">
                                                            <p className="font-bold text-[#0b1c30] line-clamp-1">{room.title}</p>
                                                            <p className="text-[12px] text-[#3d4947] mt-1">{room.ward}, {room.district}</p>
                                                        </td>
                                                        <td className="py-3 px-4 align-top">
                                                            <div className="font-bold text-[#ba1a1a]">{formatPrice(room.price)}/th</div>
                                                            <div className="text-[12px] text-[#6d7a77] mt-1">{room.area}m²</div>
                                                        </td>
                                                        <td className="py-3 px-4 align-top text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button className={styles.btnIconView} title="Xem chi tiết" onClick={(e) => { e.stopPropagation(); setActiveId(room.id); }}>
                                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                                </button>
                                                                <button
                                                                    className={styles.btnIconApprove}
                                                                    title="Duyệt nhanh"
                                                                    onClick={(e) => { e.stopPropagation(); setModalConfig({ show: true, type: 'approve', room }); }}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                                                </button>
                                                                <button
                                                                    className={styles.btnIconReject}
                                                                    title="Từ chối"
                                                                    onClick={(e) => { e.stopPropagation(); setModalConfig({ show: true, type: 'reject', room }); }}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* CỘT PHẢI: Khung Detail Drawer */}
                            <div className="lg:col-span-5 xl:col-span-4">
                                {activeRoom ? (
                                    <div className={styles.drawerContainer}>
                                        <div className={styles.drawerHeader}>
                                            <span className="font-bold text-[#0b1c30] text-[15px]">Chi tiết #TT-{activeRoom.id}</span>
                                        </div>

                                        <div className={styles.drawerBody}>
                                            <img src={activeRoom.imageUrl ? `${BASE_URL}${activeRoom.imageUrl}` : FALLBACK_IMG} alt="Room view" className="w-full h-56 object-cover rounded-xl shadow-sm" />
                                            <h2 className="font-bold text-[18px] text-[#0b1c30] font-['Plus_Jakarta_Sans'] leading-snug">{activeRoom.title}</h2>

                                            <div className="grid grid-cols-2 gap-3 bg-[#f8f9ff] p-4 rounded-xl border border-[#e5eeff]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Giá thuê niêm yết</span>
                                                    <span className="font-bold text-[#ba1a1a] text-[18px] font-['Plus_Jakarta_Sans']">{formatPrice(activeRoom.price)}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Diện tích sàn</span>
                                                    <span className="font-bold text-[#0b1c30] text-[18px] font-['Plus_Jakarta_Sans']">{activeRoom.area} m²</span>
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <span className="text-[11px] text-[#3d4947] block mb-1 font-semibold">Địa chỉ:</span>
                                                <p className="text-[14px] text-[#0b1c30] flex items-start gap-1.5">
                                                    <span className="material-symbols-outlined text-[#00685f] text-[18px] flex-shrink-0 mt-0.5">location_on</span>
                                                    <span>{activeRoom.addressDetail}, {activeRoom.ward}, {activeRoom.district}</span>
                                                </p>
                                            </div>

                                            <div className="mt-2">
                                                <span className="text-[11px] text-[#3d4947] block mb-1 font-semibold">Mô tả:</span>
                                                <p className="text-[14px] text-[#3d4947] bg-[#ffffff] p-3 rounded-lg border border-[#e5eeff]">
                                                    {activeRoom.description || 'Không có mô tả chi tiết.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={styles.drawerFooter}>
                                            <button className={styles.btnFullReject} onClick={() => setModalConfig({ show: true, type: 'reject', room: activeRoom })}>
                                                <span className="material-symbols-outlined">cancel</span> Từ chối
                                            </button>
                                            <button className={styles.btnFullApprove} onClick={() => setModalConfig({ show: true, type: 'approve', room: activeRoom })}>
                                                <span className="material-symbols-outlined">task_alt</span> Duyệt tin
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-8 text-center text-[#6d7a77] border border-[#e5eeff] shadow-sm">
                                        Vui lòng chọn một tin đăng bên danh sách
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* MODAL (Dùng chung cho cả Approve và Reject) */}
                {modalConfig.show && modalConfig.room && (
                    <div className={styles.modalOverlay} onClick={() => setModalConfig({ show: false, type: 'approve', room: null })}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-3 border-b border-[#e5eeff] pb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${modalConfig.type === 'approve' ? 'bg-[#e5eeff] text-[#00685f]' : 'bg-[#ffdad6] text-[#ba1a1a]'}`}>
                                    <span className="material-symbols-outlined text-[24px]">
                                        {modalConfig.type === 'approve' ? 'verified_user' : 'gpp_bad'}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-[18px] text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                                        {modalConfig.type === 'approve' ? 'Xác nhận duyệt tin' : 'Từ chối tin'} #TT-{modalConfig.room.id}
                                    </h3>
                                    <p className="text-[13px] text-[#6d7a77]">
                                        {modalConfig.type === 'approve' ? 'Tin đăng sẽ hiển thị công khai.' : 'Chủ trọ sẽ nhận được phản hồi và có quyền sửa.'}
                                    </p>
                                </div>
                            </div>

                            {modalConfig.type === 'reject' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-[#0b1c30]">Lý do từ chối (Bắt buộc):</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] outline-none focus:border-[#00685f] text-[14px] resize-none"
                                        rows={4}
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Ví dụ: Bác vui lòng cập nhật lại ảnh phòng do bị mờ..."
                                    ></textarea>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    className="px-5 py-2.5 rounded-xl bg-[#f8f9ff] text-[#3d4947] font-bold hover:bg-[#e5eeff] transition-colors"
                                    onClick={() => {
                                        setModalConfig({ show: false, type: 'approve', room: null });
                                        setRejectReason('');
                                    }}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-md flex items-center gap-2 transition-all ${modalConfig.type === 'approve' ? 'bg-[#00685f] hover:bg-[#008378]' : 'bg-[#ba1a1a] hover:bg-[#93000a]'}`}
                                    onClick={handleExecuteAction}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{modalConfig.type === 'approve' ? 'check_circle' : 'send'}</span>
                                    {modalConfig.type === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOAST THÔNG BÁO */}
                {toast.show && (
                    <div className={`${styles.toast} ${toast.isError ? 'bg-[#ba1a1a]' : 'bg-[#213145]'}`}>
                        <span className={`material-symbols-outlined text-[24px] ${toast.isError ? 'text-[#ffdad6]' : 'text-[#6ffbbe]'}`}>
                            {toast.isError ? 'feedback' : 'check_circle'}
                        </span>
                        <div className="flex flex-col">
                            <span className="font-bold text-[15px]">{toast.title}</span>
                            <span className={`text-[13px] mt-0.5 ${toast.isError ? 'text-white/90' : 'text-[#bcc9c6]'}`}>{toast.desc}</span>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}