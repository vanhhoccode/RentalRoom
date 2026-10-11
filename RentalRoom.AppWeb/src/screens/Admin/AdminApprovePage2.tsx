import React, { useState } from 'react';
import AdminLayout from '../Admin/AdminLayout/AdminLayout'; // Hãy kiểm tra lại đường dẫn import nếu cần
import styles from './AdminApprovePage.module.css';

// --- MOCK DATA ---
const MOCK_QUEUE = [
    {
        id: '#TT-9842',
        title: 'Căn hộ Studio full nội thất ban công thoáng, ngõ 175 Xuân Thủy',
        landlord: 'Bác Hùng',
        price: '4.800.000',
        area: '32',
        timeAgo: '15 phút trước',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByl43nHI9dwiy6lTJ2sX3PhHH2IdzD5cBVn927hTVw7PHnC1ErP60GwvWs8cx-8kMA5PjTthImXPwo31YnLFLdfnYEg4kFpjusA96u59Guve1NflI5RLUJ5cuIDKluE3vgKK7jZxyiN2xwzXKWpckyjmaQiuVQVtk--WV7m457CKNX5zFHa8VJ-O9fXWzhCa2QZEs1lrA-9RZWIsoJuHe7GTeKaiLBkivpkhTNTCd5Ewwuakvqt2Tc',
        amenities: ['Điều hòa', 'Nóng lạnh', 'Tủ lạnh', 'Khóa vân tay']
    },
    {
        id: '#TT-9638',
        title: 'Phòng trọ gác xép cao ráo Mễ Trì Hạ, gần Keangnam',
        landlord: 'Anh Tuấn',
        price: '2.200.000',
        area: '20',
        timeAgo: '28 phút trước',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnACvUvi3A9g1g7aEKgeWLs7HRviNbcpjoNBCQAuPcZ7hJGl2lhKC72j_p-7Dx0jGUkd60NqYrsr5YotZGy8KGR2fmrfXuIeKgTBd389wheYs6pV1Lnc__oxiQm5B-hbV_8RggpTxLv95_cDqPRJBYEakxIEO8oVarnP63wDNHDWtayD-qYCQA6kn_lYfVTBHrYRP_vxUXEXBUYImWftoV_gkY4-UCzcjgUfn_xgcc7H9d8_45GS1k',
        amenities: ['Nóng lạnh', 'Giường tủ', 'Gác xép']
    }
];

export default function AdminApprovePage() {
    const [queue, setQueue] = useState(MOCK_QUEUE);
    const [activeId, setActiveId] = useState(MOCK_QUEUE[0]?.id);

    // States cho Modal & Toast
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomToReject, setRoomToReject] = useState<string | null>(null);
    const [toast, setToast] = useState({ show: false, title: '', desc: '' });

    const activeRoom = queue.find(r => r.id === activeId) || queue[0];

    const showToast = (title: string, desc: string) => {
        setToast({ show: true, title, desc });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    const handleApprove = (id: string) => {
        showToast('Đã duyệt thành công', `Tin đăng ${id} đã được hiển thị trên hệ thống.`);
        setQueue(prev => prev.filter(r => r.id !== id));
        if (activeId === id && queue.length > 1) setActiveId(queue[queue.findIndex(r => r.id === id) === 0 ? 1 : 0].id);
    };

    const openRejectModal = (id: string) => {
        setRoomToReject(id);
        setIsModalOpen(true);
    };

    const handleRejectConfirm = () => {
        if (roomToReject) {
            showToast('Đã từ chối tin', `Yêu cầu chỉnh sửa tin ${roomToReject} đã được gửi đến chủ nhà.`);
            setQueue(prev => prev.filter(r => r.id !== roomToReject));
            if (activeId === roomToReject && queue.length > 1) setActiveId(queue[0].id);
        }
        setIsModalOpen(false);
        setRoomToReject(null);
    };

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
                            <button className={styles.btnRefresh}>
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                Làm mới dữ liệu
                            </button>
                        </div>

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
                                            {queue.length === 0 && (
                                                <tr><td colSpan={4} className="p-8 text-center text-[#6d7a77]">Hàng chờ trống.</td></tr>
                                            )}
                                            {queue.map(room => (
                                                <tr
                                                    key={room.id}
                                                    className={`${styles.tableRow} ${activeId === room.id ? styles.tableRowActive : ''}`}
                                                    onClick={() => setActiveId(room.id)}
                                                >
                                                    <td className="py-3 px-4 align-top">
                                                        <div className="font-bold text-[#00685f]">{room.id}</div>
                                                        <div className="text-[11px] text-[#6d7a77] mt-1">{room.timeAgo}</div>
                                                    </td>
                                                    <td className="py-3 px-4 align-top">
                                                        <p className="font-bold text-[#0b1c30] line-clamp-1">{room.title}</p>
                                                        <p className="text-[12px] text-[#3d4947] mt-1">{room.landlord}</p>
                                                    </td>
                                                    <td className="py-3 px-4 align-top">
                                                        <div className="font-bold text-[#ba1a1a]">{room.price}đ</div>
                                                        <div className="text-[12px] text-[#6d7a77] mt-1">{room.area}m²</div>
                                                    </td>
                                                    <td className="py-3 px-4 align-top text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button className={styles.btnIconView} title="Xem chi tiết"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                                                            <button
                                                                className={styles.btnIconApprove}
                                                                title="Duyệt nhanh"
                                                                onClick={(e) => { e.stopPropagation(); handleApprove(room.id); }}
                                                            ><span className="material-symbols-outlined text-[18px]">check</span></button>
                                                            <button
                                                                className={styles.btnIconReject}
                                                                title="Từ chối"
                                                                onClick={(e) => { e.stopPropagation(); openRejectModal(room.id); }}
                                                            ><span className="material-symbols-outlined text-[18px]">close</span></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* CỘT PHẢI: Khung Detail Drawer */}
                            <div className="lg:col-span-5 xl:col-span-4">
                                {activeRoom ? (
                                    <div className={styles.drawerContainer}>
                                        <div className={styles.drawerHeader}>
                                            <span className="font-bold text-[#0b1c30] text-[15px]">Chi tiết {activeRoom.id}</span>
                                            <span className="text-[12px] text-[#6d7a77]">{activeRoom.timeAgo}</span>
                                        </div>

                                        <div className={styles.drawerBody}>
                                            <img src={activeRoom.img} alt={activeRoom.title} className="w-full h-56 object-cover rounded-xl shadow-sm" />
                                            <h2 className="font-bold text-[18px] text-[#0b1c30] font-['Plus_Jakarta_Sans'] leading-snug">{activeRoom.title}</h2>

                                            <div className="grid grid-cols-2 gap-3 bg-[#f8f9ff] p-4 rounded-xl border border-[#e5eeff]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Giá thuê niêm yết</span>
                                                    <span className="font-bold text-[#ba1a1a] text-[18px] font-['Plus_Jakarta_Sans']">{activeRoom.price} đ</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Diện tích sàn</span>
                                                    <span className="font-bold text-[#0b1c30] text-[18px] font-['Plus_Jakarta_Sans']">{activeRoom.area} m²</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 mt-2">
                                                <span className="text-[13px] font-bold text-[#0b1c30]">Tiện ích phòng:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeRoom.amenities.map((am, idx) => (
                                                        <span key={idx} className="px-2.5 py-1 bg-[#eff4ff] text-[#00685f] border border-[#dce9ff] text-[12px] font-semibold rounded-lg flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[14px]">check_circle</span> {am}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.drawerFooter}>
                                            <button className={styles.btnFullReject} onClick={() => openRejectModal(activeRoom.id)}>
                                                <span className="material-symbols-outlined">cancel</span> Từ chối
                                            </button>
                                            <button className={styles.btnFullApprove} onClick={() => handleApprove(activeRoom.id)}>
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

                {/* MODAL TỪ CHỐI */}
                {isModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-3 border-b border-[#e5eeff] pb-4">
                                <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[24px]">gpp_bad</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-[18px] text-[#0b1c30] font-['Plus_Jakarta_Sans']">Từ chối tin {roomToReject}</h3>
                                    <p className="text-[13px] text-[#6d7a77]">Chủ trọ sẽ nhận được phản hồi và có quyền sửa.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-[#0b1c30]">Lý do / Hướng dẫn sửa (Bắt buộc):</label>
                                <textarea
                                    className="w-full p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] outline-none focus:border-[#00685f] focus:ring-2 focus:ring-[#eff4ff] text-[14px] transition-all resize-none"
                                    rows={4}
                                    placeholder="Ví dụ: Bác vui lòng cập nhật lại ảnh phòng do bị mờ..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button className="px-5 py-2.5 rounded-xl bg-[#f8f9ff] text-[#3d4947] font-bold hover:bg-[#e5eeff] transition-colors" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                <button className="px-5 py-2.5 rounded-xl bg-[#ba1a1a] text-white font-bold shadow-md hover:bg-[#93000a] transition-all flex items-center gap-2" onClick={handleRejectConfirm}>
                                    <span className="material-symbols-outlined text-[18px]">send</span> Xác nhận từ chối
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOAST THÔNG BÁO */}
                {toast.show && (
                    <div className={styles.toast}>
                        <span className="material-symbols-outlined text-[#6ffbbe] text-[24px]">check_circle</span>
                        <div className="flex flex-col">
                            <span className="font-bold text-[15px]">{toast.title}</span>
                            <span className="text-[13px] text-[#bcc9c6] mt-0.5">{toast.desc}</span>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}