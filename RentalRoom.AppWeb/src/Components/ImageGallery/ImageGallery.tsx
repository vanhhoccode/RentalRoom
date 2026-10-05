import React, { useState } from 'react';
import styles from './ImageGallery.module.css';

export interface GalleryImage {
    id: string | number;
    url: string;
    caption?: string;
}

interface ImageGalleryProps {
    images: GalleryImage[];
    isEditMode?: boolean; // Nếu true sẽ hiện nút Xóa trên các ảnh
    onDeleteImage?: (id: string | number) => void;
}

export default function ImageGallery({ images, isEditMode = false, onDeleteImage }: ImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return <div className="p-8 text-center text-[#6d7a77] bg-[#eff4ff] rounded-xl">Chưa có hình ảnh nào.</div>;
    }

    const activeImage = images[activeIndex];

    return (
        <div className={styles.galleryWrapper}>

            {/* KHỐI ẢNH CHÍNH (MAIN IMAGE) */}
            <div className={styles.mainImageContainer}>
                <img
                    src={activeImage.url}
                    alt={activeImage.caption || `Ảnh ${activeIndex + 1}`}
                    className={styles.mainImage}
                />
                <div className={styles.gradientOverlay}></div>

                {/* Counter Overlay */}
                <div className={styles.photoCounter}>
                    <span className="material-symbols-outlined text-[16px] text-[#89f5e7]">photo_camera</span>
                    <span>Ảnh {activeIndex + 1} / {images.length} {activeImage.caption ? `• ${activeImage.caption}` : ''}</span>
                </div>

                {/* Nút Xem tất cả (Chỉ hiện nếu không phải chế độ sửa) */}
                {!isEditMode && images.length > 1 && (
                    <button className={styles.btnViewAll}>
                        <span className="material-symbols-outlined text-[16px]">photo_library</span>
                        <span>Xem tất cả {images.length} ảnh</span>
                    </button>
                )}
            </div>

            {/* KHỐI THUMBNAILS (GRID) */}
            {images.length > 1 && (
                <div className={styles.thumbGrid}>
                    {images.map((img, index) => {
                        const isActive = index === activeIndex;

                        return (
                            <div
                                key={img.id}
                                className={`${styles.thumbItem} group ${isActive ? styles.thumbItemActive : styles.thumbItemInactive}`}
                                onClick={() => setActiveIndex(index)}
                            >
                                <img src={img.url} alt={`Thumb ${index + 1}`} className={styles.thumbImg} />

                                {/* Tag "Ảnh bìa" cho ảnh đầu tiên */}
                                {index === 0 && <span className={styles.coverTag}>Ảnh bìa</span>}

                                {/* Nút Xóa (Nếu ở chế độ Edit) */}
                                {isEditMode && onDeleteImage && (
                                    <button
                                        className={styles.btnDelete}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteImage(img.id);
                                            if (isActive && index > 0) setActiveIndex(index - 1);
                                        }}
                                        title="Xóa ảnh này"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}