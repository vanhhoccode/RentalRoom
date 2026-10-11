import React from 'react';
import StatusBadge, { RoomStatus } from '../StatusBadgeLanlord/StatusBadge';
import styles from './ListingRow.module.css';

export interface RoomData {
    id: string | number;
    title: string;
    price: number;
    area: number;

    location: string;
    addressDetail: string;
    status: RoomStatus;
    createdAt: string;
    imageUrl: string;
    imageCount?: number;
}

interface ListingRowProps {
    room: RoomData;
    onView: (id: string | number) => void;
    onEdit: (id: string | number) => void;
    onDelete: (id: string | number) => void;
    onToggleStatus: (id: string | number) => void;
}

export default function ListingRow({ room, onView, onEdit, onDelete, onToggleStatus }: ListingRowProps) {
    const isRented = room.status === 'Rented';

    const formatPrice = (price: number) => {
        return price ? `${(price / 1000000).toFixed(1)} tr` : 'Thỏa thuận';
    };

    return (
        <div className={`${styles.rowBase} group ${isRented ? styles.rowRented : ''}`}>

            <div className={styles.mainInfo}>
                <div className={styles.thumbWrapper} onClick={() => onView(room.id)}>
                    <img
                        className={`${styles.thumbImg} group-hover:scale-105 ${isRented ? styles.thumbGrayscale : ''}`}
                        src={room.imageUrl}
                        alt={room.title}
                    />
                    <span className={styles.areaTag}>{room.area} m²</span>
                </div>

                <div className={styles.detailCol}>
                    <div className={styles.metaRow}>
                        <StatusBadge status={room.status} size="sm" />
                        <span className={styles.dateText}>
                            <span className="material-symbols-outlined text-[14px]">
                                {room.status === 'Pending' ? 'schedule' : 'calendar_today'}
                            </span>
                            {room.createdAt ? new Date(room.createdAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })
                                : 'Chưa có ngày tạo'}
                        </span>
                    </div>

                    <h3 className={styles.title} onClick={() => onView(room.id)}>
                        {room.title}
                    </h3>

                    <div className={styles.priceRow}>
                        <span className={`${styles.price} ${isRented ? styles.priceInactive : styles.priceActive}`}>
                            {formatPrice(room.price)}<span className="text-xs font-normal text-[#3d4947] ml-0.5">/tháng</span>
                        </span>
                        <span className={styles.location}>
                            <span className="material-symbols-outlined text-[15px] text-[#6d7a77]">location_on</span>
                            {room.addressDetail}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.actionGroup}>
                <button className={styles.btnToggleStatus} onClick={() => onToggleStatus(room.id)}>
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    Đổi trạng thái
                </button>

                <div className={styles.iconGroup}>
                    {/* Nút Xem Chi Tiết */}
                    <button className={`${styles.btnIcon} relative group/action`} onClick={() => onView(room.id)}>
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0b1c30] text-white text-[11px] font-medium rounded opacity-0 invisible group-hover/action:opacity-100 group-hover/action:visible transition-all duration-200 whitespace-nowrap z-10 shadow-md">
                            Xem chi tiết
                            {/* Mũi tên tooltip */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#0b1c30]"></div>
                        </div>
                    </button>

                    {/* Nút Chỉnh Sửa */}
                    <button className={`${styles.btnIcon} relative group/action`} onClick={() => onEdit(room.id)}>
                        <span className="material-symbols-outlined text-[20px]">edit_square</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0b1c30] text-white text-[11px] font-medium rounded opacity-0 invisible group-hover/action:opacity-100 group-hover/action:visible transition-all duration-200 whitespace-nowrap z-10 shadow-md">
                            Chỉnh sửa tin
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#0b1c30]"></div>
                        </div>
                    </button>

                    {/* Nút Xóa */}
                    <button className={`${styles.btnIconDanger} relative group/action`} onClick={() => onDelete(room.id)}>
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#ba1a1a] text-white text-[11px] font-medium rounded opacity-0 invisible group-hover/action:opacity-100 group-hover/action:visible transition-all duration-200 whitespace-nowrap z-10 shadow-md">
                            Xóa tin
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#ba1a1a]"></div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}