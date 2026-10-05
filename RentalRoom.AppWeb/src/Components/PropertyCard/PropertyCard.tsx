import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PropertyCard.module.css';

export interface PropertyCardProps {
  id: number | string;
  imageUrl?: string;
  imageAlt?: string;
  title?: string;
  priceFormatted?: string;
  oldPriceFormatted?: string;
  area?: number | string;
  address?: string;
  schoolProximity?: string;
  status?: 'available' | 'rented';
  statusText?: string;
  photoCount?: number;
  landlordName?: string;
  landlordAvatar?: string;
  verifiedHost?: boolean;
  features?: string[];
  discountText?: string;
  rentedTimeAgo?: string;
  variant?: 'search' | 'favorite' | 'similar';
  onToggleFavorite?: () => Promise<void> | void; // Chấp nhận hàm bất đồng bộ
  onDelete?: () => void;
  onActionClick?: () => void;
  onContactClick?: () => void;
  isFavorite?: boolean;
}

export default function PropertyCard({
  id,
  imageUrl,
  imageAlt,
  title,
  priceFormatted,
  oldPriceFormatted,
  area,
  address,
  schoolProximity,
  status = 'available',
  statusText,
  photoCount = 6,
  landlordName = 'Chính chủ',
  landlordAvatar,
  verifiedHost = true,
  features = [],
  discountText,
  rentedTimeAgo = 'Hôm qua',
  variant = 'search',
  onToggleFavorite,
  onDelete,
  onActionClick,
  onContactClick,
  isFavorite = false
}: PropertyCardProps) {
  const navigate = useNavigate();
  const [isFavLoading, setIsFavLoading] = useState(false);

  const isAvailable = status === 'available';
  const isRented = status === 'rented';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <article
        onClick={() => navigate(`/rooms/${id}`)}
        className={`${styles.cardArticle} cursor-pointer ${!isAvailable ? styles.cardRentedOpacity : ''}`}
      >
        <div className={styles.mediaHeader}>
          <img
            src={imageUrl}
            alt={imageAlt || title}
            className={`${styles.cardImage} ${isRented ? styles.imageRentedEffect : ''}`}
          />

          {isAvailable ? (
            <div className={styles.badgeAvailable}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={styles.pingDot}></span>
                <span className={styles.staticDotAvailable}></span>
              </span>
              <span className={styles.statusTextAvailable}>
                {statusText || 'Còn trống'}
              </span>
            </div>
          ) : (
            <div className={styles.badgeRented}>
              <span className={styles.staticDotRented}></span>
              <span className={styles.statusTextRented}>
                {statusText || `Đã cho thuê (${rentedTimeAgo})`}
              </span>
            </div>
          )}

          {discountText && isAvailable && (
            <div className={styles.discountTag}>
              <span className={`material-symbols-outlined ${styles.discountIcon}`}>local_offer</span>
              <span>{discountText}</span>
            </div>
          )}

          {/* Nút Yêu thích xử lý chặn event nhảy trang và chống spam */}
          <button
            type="button"
            disabled={isFavLoading}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!onToggleFavorite || isFavLoading) return;

              setIsFavLoading(true);
              try {
                await onToggleFavorite();
              } finally {
                setIsFavLoading(false);
              }
            }}
            className={`${styles.favoriteBtn} ${isFavLoading ? 'opacity-50 cursor-wait' : ''}`}
            title="Lưu tin yêu thích"
          >
            <span
              className={`material-symbols-outlined ${styles.favoriteIcon} ${isFavorite ? 'text-[#ba1a1a]' : ''}`}
              style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>

          {photoCount && (
            <div className={styles.photoCounter}>
              <span className={`material-symbols-outlined ${styles.cameraIcon}`}>photo_camera</span>
              <span>{photoCount} ảnh</span>
            </div>
          )}
        </div>

        <div className={styles.cardBody}>
          <div>
            <div className={styles.priceAreaRow}>
              <div className={styles.priceWrapper}>
                <span className={`${styles.currentPrice} ${isRented ? styles.priceRentedStyle : styles.priceNormalStyle}`}>
                  {priceFormatted}
                </span>
                <span className={styles.pricePeriod}>/tháng</span>
                {oldPriceFormatted && (
                  <span className={styles.oldPrice}>
                    {oldPriceFormatted}
                  </span>
                )}
              </div>
              {area && (
                <span className={styles.areaBadge}>
                  {area} m²
                </span>
              )}
            </div>

            <h3 className={`${styles.cardTitle} ${isRented ? styles.titleRentedStyle : styles.titleNormalStyle}`}>
              {title}
            </h3>

            <div className={styles.locationContainer}>
              <span className={`material-symbols-outlined ${styles.locationIcon} ${isRented ? styles.locationIconRented : styles.locationIconNormal}`}>
                location_on
              </span>
              <div className={styles.addressTextWrapper}>
                <span className={`${styles.addressMainText} ${isRented ? styles.addressMainRented : styles.addressMainNormal}`}>
                  {address}
                </span>
                {schoolProximity && (
                  <span className={styles.schoolProximityText}>
                    {schoolProximity}
                  </span>
                )}
              </div>
            </div>

            {features.length > 0 && variant !== 'similar' && (
              <div className={styles.featuresContainer}>
                {features.map((feature, idx) => (
                  <span
                    key={idx}
                    className={`${styles.featureChip} ${isRented ? styles.featureChipRented : styles.featureChipNormal}`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}

            {isRented && variant === 'favorite' && (
              <div className={styles.suggestionBox}>
                <span className={`material-symbols-outlined ${styles.suggestionIcon}`}>assistant</span>
                <span>Khu vực này đang có các phòng tương tự đang sẵn sàng.</span>
              </div>
            )}
          </div>

          {variant === 'favorite' && isRented ? (
            <div className={styles.favoriteRentedFooter}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (onActionClick) onActionClick(); }}
                className={styles.findSimilarBtn}
              >
                <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                <span>Tìm phòng tương tự quanh đây</span>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(); }}
                className={styles.deleteFavBtn}
              >
                <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                <span>Xóa lưu tin</span>
              </button>
            </div>
          ) : (
            <div className={styles.standardFooter}>
              <div className={styles.landlordInfoWrapper}>
                {landlordAvatar && (
                  <img
                    src={landlordAvatar}
                    alt={landlordName}
                    className={`${styles.landlordAvatar} ${isRented ? styles.avatarRented : ''}`}
                  />
                )}
                <div className={styles.landlordTextCol}>
                  <span className={`${styles.landlordName} ${isRented ? styles.landlordNameRented : styles.landlordNameNormal}`}>
                    {landlordName}
                  </span>
                  <span className={`${styles.verifiedStatusRow} ${verifiedHost ? styles.verifiedGreen : styles.verifiedGray}`}>
                    {verifiedHost && <span className={`material-symbols-outlined ${styles.verifiedIcon}`}>verified</span>}
                    {verifiedHost ? 'Chính chủ xác thực' : (isRented ? 'Đã cho thuê' : 'Đang cập nhật')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (onContactClick) onContactClick(); }}
                className={`${styles.contactBtn} ${isRented ? styles.contactBtnRented : styles.contactBtnNormal}`}
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>Liên hệ</span>
              </button>
            </div>
          )}
        </div>
      </article>
    </>
  );
}