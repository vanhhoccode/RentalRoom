import React from 'react';
import styles from './ImageDropzone.module.css';

interface ImageDropzoneProps {
    onFileSelect?: (files: FileList | null) => void;
}

export default function ImageDropzone({ onFileSelect }: ImageDropzoneProps) {
    // Ẩn thẻ input type=file, chỉ trigger qua label
    return (
        <label className={styles.dropzone}>
            <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/heic"
                className="hidden"
                onChange={(e) => onFileSelect && onFileSelect(e.target.files)}
            />

            <div className={styles.iconWrapper}>
                <span className="material-symbols-outlined text-[26px]">add_photo_alternate</span>
            </div>

            <div className="flex flex-col">
                <span className={styles.title}>Tải thêm ảnh phòng hoặc video</span>
                <span className={styles.subtitle}>PNG, JPG, HEIC tối đa 10MB mỗi file (Kéo thả hoặc bấm để chọn)</span>
            </div>
        </label>
    );
}