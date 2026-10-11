import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { getPendingRooms, approveRoom, rejectRoom } from '../../Services/adminService';

const BASE_URL = 'https://localhost:7188';
const FALLBACK_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKe9QZcDH0lzkTSl-nLSODpVJ8EdJxTrsAa7POpFxGCS2MFIBy7XkWLmaXTVm0N0936jWfvPGXZyUmhh1F40_c5rws4O1tBSZAx8rVewiODyByjDGm5MLjuADhkR5kxWNox82BYtGkcCEfI7y37qVtRIlt4P91YNvjTAtxB8v_e_mBS475x-9fa3QgEn0JB1auTj0BpK6h-3D6NHjUMLo5nlhnT09xouI2FujXPZVSqNPrC7DMoeqf';

export default function AdminApprovePage() {
    const navigate = useNavigate();

    const [pendingRooms, setPendingRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Layout & UI States
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
    const [modalConfig, setModalConfig] = useState<{ show: boolean, type: 'approve' | 'reject', room: any | null }>({ show: false, type: 'approve', room: null });
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // [MỚI THÊM] State lưu lý do từ chối
    const [rejectReason, setRejectReason] = useState('');

    // Load Data
    useEffect(() => {
        // const token = localStorage.getItem('accessToken');
        // const user = JSON.parse(localStorage.getItem('user') || 'null');

        // if (!token) {
        //     alert("Vui lòng đăng nhập.");
        //     navigate('/login');
        //     return;
        // }
        // if (user?.roleCode !== 'ADMIN') {
        //     alert("Chỉ Admin mới có quyền truy cập trang này.");
        //     navigate('/');
        //     return;
        // }
        // fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await getPendingRooms();
            setPendingRooms(data);
            if (data.length > 0) setSelectedRoom(data[0]);
            else setSelectedRoom(null);
        } catch (err: any) {
            setErrorMsg(err.message || 'Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // API Actions
    const handleExecuteAction = async () => {
        const { type, room } = modalConfig;
        if (!room) return;

        try {
            if (type === 'approve') {
                await approveRoom(room.id);
                showToast(`Duyệt tin thành công! Tin #TT-${room.id} đã chuyển sang trạng thái Available.`);
            } else {
                // [MỚI THÊM] Bắt buộc nhập lý do
                if (!rejectReason.trim()) {
                    alert("Vui lòng nhập lý do từ chối để thông báo cho chủ trọ!");
                    return;
                }
                await rejectRoom(room.id, rejectReason);
                showToast(`Đã từ chối tin #TT-${room.id} thành công.`);
            }

            // Cập nhật lại UI sau khi thao tác
            const newList = pendingRooms.filter(r => r.id !== room.id);
            setPendingRooms(newList);

            if (selectedRoom?.id === room.id) {
                setSelectedRoom(newList.length > 0 ? newList[0] : null);
            }

            // Reset Modal
            setModalConfig({ show: false, type: 'approve', room: null });
            setRejectReason('');

        } catch (err: any) {
            alert(err.message);
        }
    };

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 4000);
    };

    const formatPrice = (price: number) => price ? `${(price / 1000000).toFixed(1)} tr` : 'Thỏa thuận';

    return (
        <div className="bg-[#f8f9ff] font-['Be_Vietnam_Pro'] text-[#0b1c30] antialiased min-h-screen">
            <Header />

            <main className="w-full pt-20 bg-[#f8f9ff] min-h-[calc(100vh-280px)]">
                <div className="flex flex-col w-full">

                    <div className="w-full bg-[#ffffff] shadow-sm mb-4">
                        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex items-center flex-wrap gap-1 text-[#3d4947] text-[14px]">
                                <span className="material-symbols-outlined text-[16px]">home</span> Trang chủ
                                <span className="text-[#bcc9c6] text-xs px-1">/</span>
                                <span className="hover:text-[#00685f] transition-colors cursor-pointer">Quản trị hệ thống</span>
                                <span className="text-[#bcc9c6] text-xs px-1">/</span>
                                <span className="font-semibold text-[#00685f]">Duyệt tin đăng</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00855b]/15 text-[#006947] text-[12px] font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-[#006947] animate-pulse"></span>
                                    <span>Hệ thống kiểm duyệt 24/7 đang hoạt động</span>
                                </div>
                                <span className="text-[#bcc9c6]">•</span>
                                <span className="text-[#3d4947] text-[12px] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-[#00685f]">sync</span> Cập nhật: Real-time
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 w-full pb-12">

                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="font-['Plus_Jakarta_Sans'] text-[32px] text-[#0b1c30] tracking-tight font-bold">Duyệt Tin Đăng Phòng Trọ</h1>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[14px] font-bold">
                                            {pendingRooms.length} tin Pending cần xử lý
                                        </span>
                                    </div>
                                    <p className="text-[14px] text-[#3d4947] mt-1">Kiểm tra thông tin pháp lý, chất lượng hình ảnh và phê duyệt trước khi hiển thị công khai trên TroTot.vn.</p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button onClick={fetchData} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-[14px] transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                                        <span>Làm mới dữ liệu</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading && <p className="text-[#3d4947] font-semibold italic mb-4">Đang tải danh sách chờ duyệt...</p>}
                        {errorMsg && <div className="bg-[#ffdad6] text-[#93000a] p-4 rounded-xl mb-4">{errorMsg}</div>}

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                            <div className="xl:col-span-7 flex flex-col gap-3">
                                <div className="bg-[#ffffff] rounded-xl shadow-sm overflow-hidden border border-[#e5eeff]">
                                    <div className="px-4 py-3 bg-[#eff4ff] flex items-center justify-between">
                                        <span className="text-[16px] text-[#0b1c30] flex items-center gap-2 font-bold">
                                            <span className="material-symbols-outlined text-[#00685f] text-[20px]">format_list_bulleted</span>
                                            Danh sách tin chờ kiểm duyệt
                                        </span>
                                        <span className="text-[11px] text-[#3d4947] font-semibold">Tổng số {pendingRooms.length} tin</span>
                                    </div>

                                    {pendingRooms.length === 0 && !loading && !errorMsg ? (
                                        <div className="p-8 text-center text-[#6d7a77]">Tuyệt vời! Không có tin đăng nào đang chờ duyệt.</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-[#eff4ff]/60 text-[#3d4947] text-[11px] uppercase tracking-wider font-semibold">
                                                        <th className="py-3 px-4">Phòng & ID</th>
                                                        <th className="py-3 px-3">Thông tin & Vị trí</th>
                                                        <th className="py-3 px-3">Giá & Diện tích</th>
                                                        <th className="py-3 px-4 text-right">Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#dce9ff]">
                                                    {pendingRooms.map(room => (
                                                        <tr
                                                            key={room.id}
                                                            onClick={() => setSelectedRoom(room)}
                                                            className={`cursor-pointer group transition-colors ${selectedRoom?.id === room.id ? 'bg-[#eff4ff]/60 border-l-4 border-[#00685f]' : 'bg-[#eff4ff]/20 hover:bg-[#dce9ff]/60 border-l-4 border-transparent'}`}
                                                        >
                                                            <td className="py-3 px-4 align-top">
                                                                <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-[#e5eeff] flex-shrink-0 shadow-sm">
                                                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={room.imageUrl ? `${BASE_URL}${room.imageUrl}` : FALLBACK_IMG} alt="Room" />
                                                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#0b1c30]/80 text-white text-[10px] font-mono">
                                                                        #TT-{room.id}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-3 align-top">
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-semibold">Ưu tiên</span>
                                                                    <span className="text-[#3d4947] text-[11px] flex items-center gap-0.5"><span className="material-symbols-outlined text-[13px]">schedule</span> Mới cập nhật</span>
                                                                </div>
                                                                <span className="text-[16px] text-[#0b1c30] group-hover:text-[#00685f] font-bold line-clamp-1">
                                                                    {room.title}
                                                                </span>
                                                                <span className="text-[#3d4947] text-[12px] flex items-center gap-1 mt-0.5">
                                                                    <span className="material-symbols-outlined text-[#6d7a77] text-[14px]">pin_drop</span> {room.ward}, {room.district}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 align-top">
                                                                <div className="font-['Plus_Jakarta_Sans'] text-[20px] text-[#ba1a1a] whitespace-nowrap font-bold">
                                                                    {formatPrice(room.price)}<span className="text-[12px] font-normal text-[#3d4947]">/th</span>
                                                                </div>
                                                                <div className="text-[11px] text-[#3d4947] mt-0.5 font-semibold">{room.area} m²</div>
                                                            </td>
                                                            <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button
                                                                        className="p-1.5 rounded-lg bg-[#e5eeff] hover:bg-[#d3e4fe] text-[#00685f] transition-colors"
                                                                        onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }}
                                                                        title="Xem chi tiết"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                                    </button>
                                                                    <button
                                                                        className="p-1.5 rounded-lg bg-[#006947] hover:bg-[#00855b] text-white transition-colors"
                                                                        onClick={(e) => { e.stopPropagation(); setModalConfig({ show: true, type: 'approve', room }); }}
                                                                        title="Duyệt nhanh"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                                                    </button>
                                                                    <button
                                                                        className="p-1.5 rounded-lg bg-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white text-[#93000a] transition-colors"
                                                                        onClick={(e) => { e.stopPropagation(); setModalConfig({ show: true, type: 'reject', room }); }}
                                                                        title="Từ chối"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">close</span>
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

                            {selectedRoom && (
                                <div className="xl:col-span-5 bg-[#ffffff] rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 border border-[#e5eeff] sticky top-24">
                                    <div className="p-4 bg-[#eff4ff] flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-lg bg-[#d3e4fe] text-[#00685f] font-bold text-[14px]">
                                                #TT-{selectedRoom.id}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping"></span> Chờ duyệt (Pending)
                                            </span>
                                        </div>
                                        <button className="p-1.5 rounded-full hover:bg-[#dce9ff] text-[#3d4947] transition-colors" onClick={() => setSelectedRoom(null)} title="Đóng ngăn chi tiết">
                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                        </button>
                                    </div>

                                    <div className="p-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                                        <div>
                                            <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-sm mb-2">
                                                <img className="w-full h-full object-cover" src={selectedRoom.imageUrl ? `${BASE_URL}${selectedRoom.imageUrl}` : FALLBACK_IMG} alt="Main room view" />
                                                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-[#0b1c30]/85 backdrop-blur-md text-white text-[11px] flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[15px] text-[#6ffbbe]">verified</span> Ảnh chụp thực tế
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="h-14 rounded-lg overflow-hidden shadow-sm ring-2 ring-[#00685f]"><img className="w-full h-full object-cover" src={selectedRoom.imageUrl ? `${BASE_URL}${selectedRoom.imageUrl}` : FALLBACK_IMG} alt="Thumb" /></div>
                                                <div className="h-14 rounded-lg overflow-hidden shadow-sm opacity-75"><img className="w-full h-full object-cover" src={FALLBACK_IMG} alt="Thumb" /></div>
                                                <div className="h-14 rounded-lg overflow-hidden shadow-sm opacity-75"><img className="w-full h-full object-cover" src={FALLBACK_IMG} alt="Thumb" /></div>
                                                <div className="h-14 rounded-lg overflow-hidden shadow-sm opacity-75"><img className="w-full h-full object-cover" src={FALLBACK_IMG} alt="Thumb" /></div>
                                            </div>
                                        </div>

                                        <div className="bg-[#eff4ff]/70 p-4 rounded-xl flex flex-col gap-2">
                                            <h2 className="text-[16px] text-[#0b1c30] font-bold">{selectedRoom.title}</h2>
                                            <div className="flex items-baseline gap-3 flex-wrap mt-1">
                                                <span className="font-['Plus_Jakarta_Sans'] text-[24px] text-[#ba1a1a] font-extrabold">{formatPrice(selectedRoom.price)}</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 bg-[#ffffff]/80 p-2.5 rounded-lg text-[12px]">
                                                <div className="text-[#3d4947]">Diện tích: <span className="text-[#0b1c30] font-semibold">{selectedRoom.area} m²</span></div>
                                                <div className="text-[#3d4947]">Trạng thái: <span className="text-[#0b1c30] font-semibold">{selectedRoom.status}</span></div>
                                            </div>

                                            <div className="mt-2">
                                                <span className="text-[11px] text-[#3d4947] block mb-1 font-semibold">Địa chỉ phòng trọ:</span>
                                                <p className="text-[14px] text-[#0b1c30] flex items-start gap-1.5">
                                                    <span className="material-symbols-outlined text-[#00685f] text-[18px] flex-shrink-0 mt-0.5">location_on</span>
                                                    <span>{selectedRoom.addressDetail}, {selectedRoom.ward}, {selectedRoom.district}</span>
                                                </p>
                                            </div>

                                            <div className="mt-2">
                                                <span className="text-[11px] text-[#3d4947] block mb-1 font-semibold">Mô tả của chủ trọ:</span>
                                                <p className="text-[14px] text-[#3d4947] bg-[#ffffff] p-3 rounded-lg border border-[#e5eeff]">
                                                    {selectedRoom.description || 'Không có mô tả chi tiết.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-[#eff4ff]/70 p-4 rounded-xl">
                                            <span className="text-[12px] text-[#0b1c30] font-bold block mb-2">Hồ sơ chủ nhà & Xác minh pháp lý:</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-[#008378] text-white flex items-center justify-center font-bold text-[16px]">C</div>
                                                <div>
                                                    <div className="text-[16px] text-[#0b1c30] font-bold flex items-center gap-1.5">
                                                        Chính chủ đăng tin <span className="material-symbols-outlined text-[#006947] text-[18px]">verified</span>
                                                    </div>
                                                    <span className="text-[12px] text-[#3d4947]">SĐT: Đã xác thực bảo mật</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[#eff4ff] flex items-center justify-between gap-3 border-t border-[#e5eeff]">
                                        <button className="flex-1 py-3 px-4 rounded-xl bg-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white text-[#93000a] text-[14px] font-bold transition-all flex items-center justify-center gap-1.5" onClick={() => setModalConfig({ show: true, type: 'reject', room: selectedRoom })}>
                                            <span className="material-symbols-outlined text-[20px]">close</span> ✕ Từ chối tin
                                        </button>
                                        <button className="flex-1 py-3 px-4 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-[14px] font-bold transition-all shadow-md flex items-center justify-center gap-1.5" onClick={() => setModalConfig({ show: true, type: 'approve', room: selectedRoom })}>
                                            <span className="material-symbols-outlined text-[20px]">check_circle</span> ✓ Duyệt tin ngay
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* CONFIRMATION MODAL POPUP */}
            {modalConfig.show && modalConfig.room && (
                <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#ffffff] max-w-md w-full rounded-2xl shadow-2xl p-8 flex flex-col gap-4 animate-in fade-in duration-200">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${modalConfig.type === 'approve' ? 'bg-[#00855b]/20 text-[#006947]' : 'bg-[#ffdad6] text-[#ba1a1a]'}`}>
                            <span className="material-symbols-outlined text-[28px]">{modalConfig.type === 'approve' ? 'verified_user' : 'warning'}</span>
                        </div>

                        <div className="text-center">
                            <h3 className="text-[22px] text-[#0b1c30] font-bold">Xác nhận {modalConfig.type === 'approve' ? 'duyệt' : 'từ chối'} tin đăng?</h3>
                            <p className="text-[16px] text-[#00685f] font-semibold mt-1 line-clamp-2">#TT-{modalConfig.room.id} - {modalConfig.room.title}</p>

                            {/* [MỚI THÊM] UI cho Modal Reject & Nhập lý do */}
                            {modalConfig.type === 'approve' ? (
                                <p className="text-[14px] text-[#3d4947] mt-2">
                                    Sau khi duyệt, tin đăng sẽ chuyển sang trạng thái Available (Còn trống) và hiển thị trực tiếp tới người tìm phòng.
                                </p>
                            ) : (
                                <div className="mt-4 text-left">
                                    <label className="text-[13px] text-[#3d4947] font-semibold mb-1 block">Lý do từ chối (Bắt buộc):</label>
                                    <textarea
                                        className="w-full bg-[#eff4ff] border border-[#dce9ff] text-[#0b1c30] p-3 rounded-xl text-[14px] outline-none focus:border-[#00685f] transition-colors"
                                        rows={3}
                                        placeholder="VD: Ảnh phòng quá mờ, sai địa chỉ, giá không hợp lệ..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                className="flex-1 py-2.5 px-4 rounded-xl bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] font-semibold transition-colors"
                                onClick={() => {
                                    setModalConfig({ show: false, type: 'approve', room: null });
                                    setRejectReason(''); // Clear lý do khi hủy
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1 text-white ${modalConfig.type === 'approve' ? 'bg-[#00685f] hover:bg-[#008378]' : 'bg-[#ba1a1a] hover:bg-[#93000a]'}`}
                                onClick={handleExecuteAction}
                            >
                                <span className="material-symbols-outlined text-[18px]">done_all</span> Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING TOAST NOTIFICATION */}
            <div className={`fixed bottom-6 right-6 z-50 bg-[#213145] text-[#eaf1ff] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 ${toastMsg ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="w-8 h-8 rounded-full bg-[#006947] text-white flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-white">Thành công!</span>
                    <span className="text-[12px] text-[#eaf1ff]/80">{toastMsg}</span>
                </div>
                <button className="text-[#eaf1ff]/60 hover:text-white ml-2" onClick={() => setToastMsg(null)}>
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>

        </div>
    );
}