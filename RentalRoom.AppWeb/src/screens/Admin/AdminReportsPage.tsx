import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { getPendingReports, processReport } from '../../Services/adminService';

const BASE_URL = 'https://localhost:7188';

export default function AdminReportsPage() {
    const navigate = useNavigate();

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // States UI
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [modalConfig, setModalConfig] = useState<{ show: boolean, type: 'Resolved' | 'Dismissed', report: any | null }>({ show: false, type: 'Resolved', report: null });
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    useEffect(() => {
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
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await getPendingReports();
            setReports(data);
            if (data.length > 0) setSelectedReport(data[0]);
            else setSelectedReport(null);
        } catch (err: any) {
            setErrorMsg(err.message || 'Lỗi tải dữ liệu. API chưa tồn tại hoặc server đang bảo trì.');
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteAction = async () => {
        const { type, report } = modalConfig;
        if (!report) return;

        try {
            // Map Dismissed -> Rejected theo chuẩn API
            const apiStatus = type === 'Dismissed' ? 'Rejected' : 'Resolved';
            await processReport(report.id, apiStatus);

            if (type === 'Resolved') {
                showToast(`Báo cáo #RP-${report.id} đã được xác nhận (Resolved). Phòng liên quan đã được xử lý.`);
            } else {
                showToast(`Báo cáo #RP-${report.id} đã bị bác bỏ (Dismissed).`);
            }

            // Xóa báo cáo khỏi danh sách chờ
            const newList = reports.filter(r => r.id !== report.id);
            setReports(newList);

            if (selectedReport?.id === report.id) {
                setSelectedReport(newList.length > 0 ? newList[0] : null);
            }
            setModalConfig({ show: false, type: 'Resolved', report: null });

        } catch (err: any) {
            alert(err.message);
        }
    };

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 4000);
    };

    return (
        <div className="bg-[#f8f9ff] font-['Be_Vietnam_Pro'] text-[#0b1c30] antialiased min-h-screen flex flex-col">
            <Header />

            <main className="w-full pt-20 flex-grow bg-[#f8f9ff]">

                {/* Top Breadcrumb & Live System Status Bar */}
                <div className="w-full bg-[#ffffff] shadow-sm mb-4">
                    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <nav className="flex items-center gap-2 text-[#3d4947] text-[14px] flex-wrap">
                            <span className="material-symbols-outlined text-[16px]">home</span>
                            <span>Trang chủ</span>
                            <span className="text-[#6d7a77]">/</span>
                            <span>Quản trị hệ thống</span>
                            <span className="text-[#6d7a77]">/</span>
                            <span className="text-[#00685f] font-semibold">Xử lý báo cáo vi phạm</span>
                        </nav>
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00855b]/10 text-[#006947] text-[12px] font-semibold">
                                <span className="w-2 h-2 rounded-full bg-[#006947] animate-pulse"></span>
                                <span>Hệ thống tiếp nhận phản ánh 24/7</span>
                            </div>
                            <span className="text-[#bcc9c6]">•</span>
                            <div className="flex items-center gap-1 text-[#3d4947] text-[12px]">
                                <span className="material-symbols-outlined text-[16px] text-[#00685f]">sync</span>
                                <span>Cập nhật: <strong className="text-[#0b1c30]">Real-time</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                <div className="max-w-[1280px] mx-auto w-full px-4 lg:px-6 pb-12 flex flex-col gap-6">

                    {/* Title Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="font-['Plus_Jakarta_Sans'] text-[32px] text-[#0b1c30] font-bold tracking-tight">Xử Lý Báo Cáo Vi Phạm</h1>
                                <span className="inline-flex items-center gap-1.5 bg-[#ffdad6]/70 text-[#93000a] px-3 py-1 rounded-full text-[14px] font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping"></span>
                                    {reports.length} báo cáo đang chờ xử lý
                                </span>
                            </div>
                            <p className="text-[14px] text-[#3d4947]">
                                Kiểm duyệt phản ánh sai lệch từ người thuê, bảo vệ sự minh bạch thông tin và chất lượng danh sách phòng trọ.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchData} className="inline-flex items-center gap-1.5 bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#0b1c30] px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                <span>Tải lại dữ liệu</span>
                            </button>
                        </div>
                    </div>

                    {loading && <p className="text-[#3d4947] italic font-semibold">Đang truy xuất hệ thống báo cáo...</p>}
                    {errorMsg && <div className="bg-[#ffdad6] text-[#93000a] p-4 rounded-xl">{errorMsg}</div>}

                    {/* Main Workspace: Grid 7-5 */}
                    <div className={`grid grid-cols-1 ${selectedReport ? 'xl:grid-cols-12' : 'xl:grid-cols-1'} gap-6 items-start`}>

                        {/* LEFT COLUMN: Bảng danh sách */}
                        <div className={selectedReport ? 'xl:col-span-7' : 'xl:col-span-12'}>
                            <div className="bg-[#ffffff] rounded-2xl shadow-sm overflow-hidden flex flex-col border border-[#e5eeff]">
                                <div className="px-4 py-3 bg-[#eff4ff] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-[#0b1c30] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#00685f] text-[20px]">report</span>
                                            Danh sách vi phạm cần duyệt
                                        </span>
                                    </div>
                                    <span className="text-[#3d4947] text-[12px] font-semibold">Tổng số {reports.length} vụ việc</span>
                                </div>

                                {reports.length === 0 && !loading && !errorMsg ? (
                                    <div className="p-8 text-center text-[#6d7a77]">Hệ thống hiện không có báo cáo nào đang chờ xử lý.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-[#eff4ff]/50 text-[#3d4947] text-[12px] border-b-0 uppercase">
                                                    <th className="py-3 px-4 font-semibold">Mã / Thời gian</th>
                                                    <th className="py-3 px-4 font-semibold">Người báo cáo</th>
                                                    <th className="py-3 px-4 font-semibold">Phòng bị phản ánh</th>
                                                    <th className="py-3 px-4 font-semibold text-center">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e5eeff] text-[#0b1c30]">
                                                {reports.map(report => (
                                                    <tr
                                                        key={report.id}
                                                        onClick={() => setSelectedReport(report)}
                                                        className={`transition-colors cursor-pointer group ${selectedReport?.id === report.id ? 'bg-[#00685f]/5 border-l-4 border-l-[#00685f]' : 'hover:bg-[#eff4ff] border-l-4 border-l-transparent'}`}
                                                    >
                                                        <td className="py-4 px-4 align-top">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[14px] text-[#00685f] font-bold flex items-center gap-1">
                                                                    <span className="w-2 h-2 rounded-full bg-[#00685f]"></span>
                                                                    #RP-{report.id}
                                                                </span>
                                                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#ffdad6]/40 text-[#ba1a1a] text-[10px] font-bold w-fit">Pending</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 align-top">
                                                            <div className="flex flex-col">
                                                                <span className="text-[14px] text-[#0b1c30] font-semibold">{report.reporterName || 'Người dùng ẩn danh'}</span>
                                                                <span className="text-[#3d4947] text-[11px] mt-0.5">{report.reason || 'Sai lệch thông tin'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 align-top">
                                                            <div className="flex flex-col max-w-[200px]">
                                                                <span className="text-[#006398] font-semibold text-[12px]">Room ID: #TT-{report.roomId}</span>
                                                                <p className="text-[#3d4947] text-[12px] line-clamp-2 mt-1">{report.description}</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 align-middle text-center whitespace-nowrap">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button className="p-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00685f] transition-colors" title="Xem chi tiết">
                                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                                </button>
                                                                <button
                                                                    className="p-1.5 rounded-lg bg-[#00855b]/10 hover:bg-[#00855b]/30 text-[#006947] transition-colors"
                                                                    onClick={(e) => { e.stopPropagation(); setModalConfig({ show: true, type: 'Resolved', report }); }}
                                                                    title="Xác nhận vi phạm"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                                </button>
                                                                <button
                                                                    className="p-1.5 rounded-lg bg-[#ffdad6]/30 hover:bg-[#ffdad6]/60 text-[#ba1a1a] transition-colors"
                                                                    onClick={(e) => { e.stopPropagation(); setModalConfig({ show: true, type: 'Dismissed', report }); }}
                                                                    title="Bác bỏ báo cáo"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Detail Drawer (5 Cols) */}
                        {selectedReport && (
                            <div className="xl:col-span-5 bg-[#ffffff] rounded-2xl shadow-lg flex flex-col transition-all duration-300 border border-[#e5eeff] sticky top-24">

                                <div className="p-4 bg-[#eff4ff] rounded-t-2xl flex items-center justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[18px] text-[#0b1c30] font-bold">#RP-{selectedReport.id}</span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[12px] font-bold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span> Chờ xử lý
                                            </span>
                                        </div>
                                    </div>
                                    <button className="p-1.5 rounded-full hover:bg-[#dce9ff] text-[#3d4947] transition-colors" onClick={() => setSelectedReport(null)}>
                                        <span className="material-symbols-outlined text-[20px]">close</span>
                                    </button>
                                </div>

                                <div className="p-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

                                    {/* Người gửi phản ánh */}
                                    <div className="bg-[#eff4ff]/60 p-3 rounded-xl flex flex-col gap-2 border border-[#e5eeff]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Người gửi phản ánh</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#00685f]/10 flex items-center justify-center text-[#00685f] font-bold text-sm">
                                                {selectedReport.reporterName ? selectedReport.reporterName.charAt(0) : 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[16px] text-[#0b1c30] font-semibold">{selectedReport.reporterName || 'Người dùng ẩn danh'}</span>
                                                <span className="text-[#3d4947] text-[12px]">Tenant Account</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phòng bị báo cáo */}
                                    <div className="p-3 rounded-xl bg-[#eff4ff]/40 flex flex-col gap-2 border border-[#e5eeff]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Phòng trọ bị báo cáo</span>
                                            <span className="text-[12px] text-[#006398] font-bold">Room ID: #TT-{selectedReport.roomId}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[16px] text-[#0b1c30] font-bold line-clamp-2">{selectedReport.title || 'Đang cập nhật tiêu đề phòng'}</span>
                                        </div>
                                    </div>

                                    {/* Chi tiết vi phạm */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Nội dung phản ánh</span>
                                            <span className="px-2 py-0.5 rounded-md bg-[#cce5ff] text-[#001d31] text-[11px] font-semibold">
                                                {selectedReport.reason || 'Vi phạm chính sách'}
                                            </span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#dce9ff]/60 text-[#0b1c30] text-[14px] italic leading-relaxed">
                                            “{selectedReport.description || 'Không có mô tả chi tiết từ người dùng.'}”
                                        </div>
                                    </div>

                                    {/* Operational Actions */}
                                    <div className="p-3 rounded-xl bg-[#eff4ff] flex flex-col gap-3 mt-2 border border-[#dce9ff]">
                                        <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Quyết định xử lý từ Quản trị viên</span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <button
                                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#dce9ff] hover:bg-[#ffdad6]/40 text-[#0b1c30] hover:text-[#ba1a1a] transition-all text-center gap-1 shadow-sm"
                                                onClick={() => setModalConfig({ show: true, type: 'Dismissed', report: selectedReport })}
                                            >
                                                <div className="flex items-center gap-1 text-[14px] font-bold">
                                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                    <span>Bác bỏ (Dismissed)</span>
                                                </div>
                                                <span className="text-[11px] text-[#3d4947]">Báo cáo không đủ căn cứ</span>
                                            </button>
                                            <button
                                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white transition-all text-center gap-1 shadow-sm"
                                                onClick={() => setModalConfig({ show: true, type: 'Resolved', report: selectedReport })}
                                            >
                                                <div className="flex items-center gap-1 text-[14px] font-bold">
                                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                    <span>Xác nhận (Resolved)</span>
                                                </div>
                                                <span className="text-[11px] text-white/80">Xác nhận vi phạm</span>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
            <Footer />

            {/* CONFIRMATION MODAL POPUP */}
            {modalConfig.show && modalConfig.report && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/60 backdrop-blur-sm">
                    <div className="bg-[#ffffff] rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl transform transition-transform duration-200 animate-in fade-in">
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${modalConfig.type === 'Resolved' ? 'bg-[#89f5e7]/40 text-[#00685f]' : 'bg-[#dce9ff] text-[#3d4947]'}`}>
                                <span className="material-symbols-outlined text-[28px]">{modalConfig.type === 'Resolved' ? 'verified_user' : 'visibility_off'}</span>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[18px] text-[#0b1c30] font-bold">Xác nhận xử lý báo cáo #RP-{modalConfig.report.id}?</h3>
                                <span className="text-[#6d7a77] text-xs mt-1">Phòng liên quan: #TT-{modalConfig.report.roomId}</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#eff4ff] text-[#3d4947] text-[14px] mb-6 leading-relaxed">
                            {modalConfig.type === 'Resolved' ? (
                                <>Đánh dấu <strong className="text-[#00685f]">Resolved</strong>: Hệ thống sẽ ghi nhận vi phạm của chủ trọ, cập nhật trạng thái báo cáo và thông báo kết quả cho người dùng.</>
                            ) : (
                                <>Đánh dấu <strong className="text-[#ba1a1a]">Dismissed</strong>: Báo cáo này sẽ bị loại bỏ do không đủ căn cứ vi phạm. Không có hình phạt nào được áp dụng.</>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button className="px-4 py-2.5 rounded-xl bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#0b1c30] font-semibold transition-colors" onClick={() => setModalConfig({ show: false, type: 'Resolved', report: null })}>
                                Hủy bỏ
                            </button>
                            <button
                                className={`px-4 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5 text-white ${modalConfig.type === 'Resolved' ? 'bg-[#00685f] hover:bg-[#008378]' : 'bg-[#3d4947] hover:bg-[#0b1c30]'}`}
                                onClick={handleExecuteAction}
                            >
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                <span>Xác nhận ngay</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING TOAST NOTIFICATION */}
            <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#ffffff] text-[#0b1c30] p-4 rounded-2xl shadow-xl border border-[#00685f]/20 transform transition-all duration-300 max-w-md ${toastMsg ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="w-10 h-10 rounded-xl bg-[#00685f] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">task_alt</span>
                </div>
                <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-[16px] font-bold text-[#0b1c30]">Xử lý thành công!</span>
                    <p className="text-[12px] text-[#3d4947]">{toastMsg}</p>
                </div>
                <button className="text-[#6d7a77] hover:text-[#0b1c30] p-1" onClick={() => setToastMsg(null)}>
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
        </div>
    );
}