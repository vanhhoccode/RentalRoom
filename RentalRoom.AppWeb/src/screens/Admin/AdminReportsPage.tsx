import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../Admin/AdminLayout/AdminLayout'; // Sửa lại đường dẫn nếu cần
import { getPendingReports, processReport } from '../../Services/adminService';
import styles from './AdminReportsPage.module.css';

export default function AdminReportsPage() {
    const navigate = useNavigate();

    // --- State Dữ Liệu API ---
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // --- State UI ---
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
    const [modalConfig, setModalConfig] = useState<{ show: boolean, type: 'Resolved' | 'Dismissed', report: any | null }>({ show: false, type: 'Resolved', report: null });
    const [toast, setToast] = useState<{ show: boolean, title: string, desc: string, isError: boolean }>({ show: false, title: '', desc: '', isError: false });

    // Lấy object report đang được chọn (để render Drawer cột phải)
    const selectedReport = reports.find(r => r.id === selectedReportId) || (reports.length > 0 ? reports[0] : null);

    // --- Logic Fetch Data ---
    useEffect(() => {
        // Có thể mở comment khi chạy thực tế có auth
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
            const data = await getPendingReports();
            setReports(data);
            if (data.length > 0) setSelectedReportId(data[0].id);
            else setSelectedReportId(null);
        } catch (err: any) {
            setErrorMsg(err.message || 'Lỗi tải dữ liệu. API chưa tồn tại hoặc server đang bảo trì.');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title: string, desc: string, isError = false) => {
        setToast({ show: true, title, desc, isError });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    // --- Logic Xử Lý Báo Cáo ---
    const handleExecuteAction = async () => {
        const { type, report } = modalConfig;
        if (!report) return;

        try {
            // Map Dismissed -> Rejected theo chuẩn API cũ
            const apiStatus = type === 'Dismissed' ? 'Rejected' : 'Resolved';
            await processReport(report.id, apiStatus);

            if (type === 'Resolved') {
                showToast('Đã xác nhận vi phạm', `Báo cáo #RP-${report.id} đã được xử lý (Hạ tin & Cảnh cáo).`);
            } else {
                showToast('Đã bác bỏ', `Báo cáo #RP-${report.id} đã bị bác bỏ do không đủ căn cứ.`, true);
            }

            // Xóa báo cáo khỏi danh sách chờ
            const newList = reports.filter(r => r.id !== report.id);
            setReports(newList);

            if (selectedReportId === report.id) {
                setSelectedReportId(newList.length > 0 ? newList[0].id : null);
            }
            setModalConfig({ show: false, type: 'Resolved', report: null });

        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra khi gọi API processReport');
        }
    };

    return (
        <AdminLayout>
            <div className={styles.pageContainer}>
                <div className={styles.mainWrapper}>
                    <div className={styles.contentContainer}>

                        {/* Macro Header */}
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                            <div>
                                <div className={styles.badgeUrgent}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                                    Hàng chờ duyệt vi phạm
                                </div>
                                <h1 className={styles.headerTitle}>Xử lý báo cáo vi phạm</h1>
                                <p className="text-[14px] text-[#6d7a77] mt-1">Đối soát khiếu nại thực tế từ người thuê, kiểm chứng bằng chứng và cập nhật trạng thái.</p>
                            </div>

                            <div className="flex items-center gap-4 p-3 rounded-xl bg-white shadow-sm border border-[#eaf1ff]">
                                <div className="w-10 h-10 rounded-lg bg-[#dce9ff] flex items-center justify-center text-[#006398]">
                                    <span className="material-symbols-outlined text-[22px]">timer</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-semibold text-[#6d7a77]">SLA Phản Hồi Hôm Nay</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[22px] font-bold text-[#006398] font-['Plus_Jakarta_Sans']">18.5 phút</span>
                                        <span className="text-[12px] text-[#bcc9c6] font-medium">/ Mục tiêu &lt; 30p</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className={styles.kpiGrid}>
                            <div className={styles.kpiCard}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[14px] font-semibold text-[#6d7a77]">Chờ xác minh</span>
                                    <span className="material-symbols-outlined text-[#ba1a1a] bg-[#ffdad6] p-1.5 rounded-lg">pending_actions</span>
                                </div>
                                <span className="text-[32px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">{reports.length}</span>
                            </div>
                            <div className={styles.kpiCard}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[14px] font-semibold text-[#6d7a77]">Đã xử lý (Resolved)</span>
                                    <span className="material-symbols-outlined text-[#065f46] bg-[#dcfce7] p-1.5 rounded-lg">check_circle</span>
                                </div>
                                <span className="text-[32px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">89</span>
                            </div>
                            <div className={styles.kpiCard}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[14px] font-semibold text-[#6d7a77]">Đã bác bỏ (Dismissed)</span>
                                    <span className="material-symbols-outlined text-[#475569] bg-[#f1f5f9] p-1.5 rounded-lg">cancel</span>
                                </div>
                                <span className="text-[32px] font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">23</span>
                            </div>
                            <div className={styles.kpiCard}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[14px] font-semibold text-[#6d7a77]">Tỉ lệ tin có căn cứ</span>
                                    <span className="material-symbols-outlined text-[#006398] bg-[#dce9ff] p-1.5 rounded-lg">fact_check</span>
                                </div>
                                <span className="text-[32px] font-bold text-[#006398] font-['Plus_Jakarta_Sans']">79.4%</span>
                            </div>
                        </div>

                        {loading && <p className="text-[#3d4947] font-semibold italic">Đang tải danh sách báo cáo...</p>}
                        {errorMsg && <div className="bg-[#ffdad6] text-[#93000a] p-4 rounded-xl">{errorMsg}</div>}

                        {/* Layout 2 cột: Bảng (Trái) & Detail Drawer (Phải) */}
                        <div className={styles.mainGrid}>

                            {/* CỘT TRÁI: Bảng danh sách */}
                            <div className={styles.leftCol}>
                                <div className={styles.tableWrapper}>
                                    <div className={styles.tableHeader}>
                                        <div className="flex items-center gap-2 bg-[#f8f9ff] px-4 py-2 rounded-xl border border-[#eaf1ff] w-1/2">
                                            <span className="material-symbols-outlined text-[#6d7a77]">search</span>
                                            <input className="bg-transparent outline-none w-full text-[14px] text-[#0b1c30] placeholder:text-[#aab8b5]" placeholder="Tìm mã #RP, #TT..." />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-[14px]">
                                            <thead className="bg-[#f8f9ff] text-[#6d7a77] border-b border-[#eaf1ff]">
                                                <tr>
                                                    <th className="py-3 px-4 font-semibold">Mã / Thời gian</th>
                                                    <th className="py-3 px-4 font-semibold">Người báo cáo</th>
                                                    <th className="py-3 px-4 font-semibold">Phòng bị phản ánh</th>
                                                    <th className="py-3 px-4 font-semibold text-right">Xem xét</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.length === 0 && !loading && !errorMsg && (
                                                    <tr><td colSpan={4} className="p-8 text-center text-[#6d7a77]">Hàng chờ xử lý trống.</td></tr>
                                                )}
                                                {reports.map((rp) => (
                                                    <tr
                                                        key={rp.id}
                                                        className={`${styles.tableRow} ${selectedReportId === rp.id ? styles.tableRowActive : ''}`}
                                                        onClick={() => setSelectedReportId(rp.id)}
                                                    >
                                                        <td className="py-4 px-4 align-top">
                                                            <div className={`font-bold ${selectedReportId === rp.id ? 'text-[#065f46]' : 'text-[#0b1c30]'}`}>#RP-{rp.id}</div>
                                                            <div className="inline-block mt-1 px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[10px] uppercase font-bold">Pending</div>
                                                        </td>
                                                        <td className="py-4 px-4 align-top">
                                                            <div className="font-semibold text-[#0b1c30]">{rp.reporterName || 'Người dùng ẩn danh'}</div>
                                                            <div className="text-[12px] text-[#6d7a77] mt-0.5">Lý do: {rp.reason || 'Sai thông tin'}</div>
                                                        </td>
                                                        <td className="py-4 px-4 align-top">
                                                            <div className="font-bold text-[#006398] hover:underline cursor-pointer">#TT-{rp.roomId}</div>
                                                            <div className="text-[13px] text-[#0b1c30] line-clamp-2 max-w-[160px]">{rp.title || 'Phòng trọ chưa cập nhật tên'}</div>
                                                        </td>
                                                        <td className="py-4 px-4 align-top text-right">
                                                            <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ml-auto ${selectedReportId === rp.id ? 'bg-[#00685f] text-white shadow-sm' : 'bg-[#eff4ff] text-[#6d7a77] hover:bg-[#eaf1ff]'}`}>
                                                                <span className="material-symbols-outlined text-[18px]">{selectedReportId === rp.id ? 'visibility' : 'chevron_right'}</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* CỘT PHẢI: Hồ Sơ Chi Tiết */}
                            <div className={styles.rightCol}>
                                {selectedReport ? (
                                    <div className={styles.drawerContainer}>
                                        <div className={styles.drawerHeader}>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-[18px] font-bold text-[#0b1c30]">Hồ sơ thẩm định #RP-{selectedReport.id}</h2>
                                                    <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold animate-pulse">Cần xem xét</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.drawerBody}>
                                            {/* Block 1: Tenant */}
                                            <div>
                                                <h3 className={styles.sectionTitle}>1. Người gửi phản ánh</h3>
                                                <div className={`${styles.sectionBlock} flex-row items-center justify-between`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#cce5ff] text-[#006398] flex items-center justify-center font-bold">
                                                            {selectedReport.reporterName ? selectedReport.reporterName.charAt(0) : 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#0b1c30] flex items-center gap-1">{selectedReport.reporterName || 'Người dùng ẩn danh'} <span className="material-symbols-outlined text-[#00685f] text-[16px]">verified</span></div>
                                                            <div className="text-[12px] text-[#6d7a77]">Tài khoản Tenant</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Block 2: Accused Listing */}
                                            <div>
                                                <h3 className={styles.sectionTitle}>2. Tin phòng bị phản ánh</h3>
                                                <div className={styles.sectionBlock}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="font-bold text-[#006398] text-[13px]">Room ID: #TT-{selectedReport.roomId}</div>
                                                    </div>
                                                    <div className="font-bold text-[#0b1c30] text-[14px]">{selectedReport.title || 'Đang cập nhật tiêu đề phòng'}</div>
                                                </div>
                                            </div>

                                            {/* Block 3: Details */}
                                            <div>
                                                <h3 className={styles.sectionTitle}>3. Nội dung phản ánh</h3>
                                                <div className="p-4 bg-[#fff1f0] rounded-xl border border-[#ffdad6]">
                                                    <div className="font-bold text-[#ba1a1a] flex items-center gap-1 mb-2">
                                                        <span className="material-symbols-outlined text-[18px]">report</span> {selectedReport.reason || 'Sai lệch thông tin'}
                                                    </div>
                                                    <p className="text-[13px] text-[#3d4947] italic">
                                                        "{selectedReport.description || 'Không có ghi chú thêm từ người dùng.'}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={() => setModalConfig({ show: true, type: 'Dismissed', report: selectedReport })} className={styles.btnDismiss}>
                                                    ✕ Bác bỏ tin
                                                </button>
                                                <button onClick={() => setModalConfig({ show: true, type: 'Resolved', report: selectedReport })} className={styles.btnResolve}>
                                                    <span className="material-symbols-outlined text-[20px]">check_circle</span> Xác nhận - Hạ tin & Cảnh cáo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-8 flex justify-center text-[#6d7a77] shadow-sm border border-[#eaf1ff]">
                                        Vui lòng chọn một báo cáo từ danh sách bên trái.
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* --- MODAL XÁC NHẬN --- */}
                {modalConfig.show && modalConfig.report && (
                    <div className={styles.modalOverlay} onClick={() => setModalConfig({ show: false, type: 'Resolved', report: null })}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3 border-b border-[#eaf1ff] pb-4 mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${modalConfig.type === 'Resolved' ? 'bg-[#dcfce7] text-[#065f46]' : 'bg-[#f1f5f9] text-[#475569]'}`}>
                                    <span className="material-symbols-outlined">{modalConfig.type === 'Resolved' ? 'verified_user' : 'visibility_off'}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[18px] text-[#0b1c30]">Xác nhận xử lý báo cáo #RP-{modalConfig.report.id}?</h3>
                                    <p className="text-[12px] text-[#6d7a77]">Phòng liên quan: #TT-{modalConfig.report.roomId}</p>
                                </div>
                            </div>

                            <div className="mb-6 p-4 rounded-xl bg-[#f8f9ff] text-[13px] text-[#3d4947] leading-relaxed">
                                {modalConfig.type === 'Resolved' ? (
                                    <>Xác nhận <strong className="text-[#00685f]">Vi phạm (Resolved)</strong>: Hệ thống sẽ hạ tin đăng và gửi email cảnh cáo tới chủ trọ.</>
                                ) : (
                                    <>Xác nhận <strong className="text-[#ba1a1a]">Bác bỏ (Dismissed)</strong>: Báo cáo này không đủ căn cứ và sẽ bị loại bỏ khỏi hàng đợi.</>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setModalConfig({ show: false, type: 'Resolved', report: null })} className="px-5 py-2.5 rounded-xl bg-[#f8f9ff] text-[#3d4947] font-bold hover:bg-[#eaf1ff]">
                                    Hủy bỏ
                                </button>
                                <button onClick={handleExecuteAction} className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-md hover:opacity-90 ${modalConfig.type === 'Resolved' ? 'bg-[#00685f]' : 'bg-[#0b1c30]'}`}>
                                    Xác nhận ngay
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TOAST --- */}
                {toast.show && (
                    <div className={`${styles.toast} ${toast.isError ? styles.toastError : styles.toastSuccess}`}>
                        <span className="material-symbols-outlined text-[24px]">
                            {toast.isError ? 'feedback' : 'check_circle'}
                        </span>
                        <div className="flex flex-col">
                            <div className="font-bold text-[14px]">{toast.title}</div>
                            <div className="text-[12px] opacity-90 mt-0.5">{toast.desc}</div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}