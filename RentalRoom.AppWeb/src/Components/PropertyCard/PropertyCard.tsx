import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PropertyCard.module.css';

export interface PropertyCardProps {
  id: number | string;
  imageUrl?: string;
  imageAlt?: string;
  title?: string;
  price?: number; // Nhận thẳng price dạng số từ DB nếu có
  priceFormatted?: string;
  oldPriceFormatted?: string;
  area?: number | string;
  address?: string; // Giữ nguyên prop address hiện tại
  district?: string;
  ward?: string;
  schoolProximity?: string;
  status?: 'available' | 'rented' | 'Available' | 'Rented' | 'Pending' | 'Rejected' | string;
  statusText?: string;
  photoCount?: number;
  landlordName?: string;
  landlordAvatar?: string;
  verifiedHost?: boolean;
  features?: string[]; // Giữ nguyên prop features hiện tại
  discountText?: string;
  rentedTimeAgo?: string;
  variant?: 'search' | 'favorite' | 'similar';
  onToggleFavorite?: () => Promise<void> | void;
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
  price,
  priceFormatted,
  oldPriceFormatted,
  area,
  address,
  district,
  ward,
  schoolProximity,
  status = 'Available',
  statusText,
  photoCount,
  landlordName,
  landlordAvatar,
  verifiedHost,
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

  // Chuẩn hóa status (tránh lỗi case-sensitive)
  const isAvailable = status.toLowerCase() === 'available';
  const isRented = status.toLowerCase() === 'rented';

  // Fallback ảnh
  const finalImg = imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKe9QZcDH0lzkTSl-nLSODpVJ8EdJxTrsAa7POpFxGCS2MFIBy7XkWLmaXTVm0N0936jWfvPGXZyUmhh1F40_c5rws4O1tBSZAx8rVewiODyByjDGm5MLjuADhkR5kxWNox82BYtGkcCEfI7y37qVtRIlt4P91YNvjTAtxB8v_e_mBS475x-9fa3QgEn0JB1auTj0BpK6h-3D6NHjUMLo5nlhnT09xouI2FujXPZVSqNPrC7DMoeqf';

  // Format Giá 
  const displayPrice = price ? `${(price / 1000000).toFixed(1)} Triệu` : (priceFormatted || 'Thỏa thuận');

  // Xử lý Địa điểm (ưu tiên ward + district, nếu không có thì lấy address truyền từ cha)
  let displayAddress = '';
  if (ward && district) displayAddress = `${ward}, ${district}`;
  else displayAddress = address || 'Đang cập nhật địa chỉ';

  // Xử lý Tiện ích (cắt 3 cái)
  const displayFeatures = features.slice(0, 3);
  const excessFeatures = features.length - 3;

  // Render badge trạng thái ảnh
  let badgeLabel = statusText;
  if (!badgeLabel) {
    if (status === 'Pending') badgeLabel = 'Chờ duyệt';
    else if (status === 'Rejected') badgeLabel = 'Bị từ chối';
    else if (status === 'Expired') badgeLabel = 'Hết hạn';
    else badgeLabel = isAvailable ? 'Còn trống' : `Đã cho thuê (${rentedTimeAgo})`;
  }

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
            src={finalImg}
            alt={imageAlt || title || 'Hình ảnh phòng'}
            className={`${styles.cardImage} ${isRented ? styles.imageRentedEffect : ''}`}
            onError={(e) => { (e.target as HTMLImageElement).src = finalImg; }}
          />

          {/* Badge Trạng thái */}
          {isAvailable ? (
            <div className={styles.badgeAvailable}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={styles.pingDot}></span>
                <span className={styles.staticDotAvailable}></span>
              </span>
              <span className={styles.statusTextAvailable}>
                {badgeLabel}
              </span>
            </div>
          ) : (
            <div className={styles.badgeRented}>
              <span className={styles.staticDotRented}></span>
              <span className={styles.statusTextRented}>
                {badgeLabel}
              </span>
            </div>
          )}

          {discountText && isAvailable && (
            <div className={styles.discountTag}>
              <span className={`material-symbols-outlined ${styles.discountIcon}`}>local_offer</span>
              <span>{discountText}</span>
            </div>
          )}

          {/* Nút Yêu thích (Độc lập, không dính href) */}
          <button
            type="button"
            disabled={isFavLoading}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation(); // Chặn click card
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

          {/* Badge 5 ảnh tự động lấy từ data thật */}
          {photoCount != null && photoCount > 0 && (
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
                  {displayPrice}
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

            <h3 className={`${styles.cardTitle} ${isRented ? styles.titleRentedStyle : styles.titleNormalStyle} line-clamp-2`}>
              {title}
            </h3>

            <div className={styles.locationContainer}>
              <span className={`material-symbols-outlined ${styles.locationIcon} ${isRented ? styles.locationIconRented : styles.locationIconNormal}`}>
                location_on
              </span>
              <div className={styles.addressTextWrapper}>
                <span className={`${styles.addressMainText} ${isRented ? styles.addressMainRented : styles.addressMainNormal} line-clamp-1`}>
                  {displayAddress}
                </span>
                {schoolProximity && (
                  <span className={styles.schoolProximityText}>
                    {schoolProximity}
                  </span>
                )}
              </div>
            </div>

            {/* Render tối đa 3 tiện ích + Số tiện ích thừa */}
            {variant !== 'similar' && (
              <div className={styles.featuresContainer}>
                {displayFeatures.length > 0 ? (
                  <>
                    {displayFeatures.map((feature, idx) => (
                      <span
                        key={idx}
                        className={`${styles.featureChip} ${isRented ? styles.featureChipRented : styles.featureChipNormal}`}
                      >
                        {feature}
                      </span>
                    ))}
                    {excessFeatures > 0 && (
                      <span className={`${styles.featureChip} ${isRented ? styles.featureChipRented : styles.featureChipNormal}`}>
                        +{excessFeatures} tiện ích
                      </span>
                    )}
                  </>
                ) : (
                  <span className={`${styles.featureChip} ${isRented ? styles.featureChipRented : styles.featureChipNormal} opacity-60`}>
                    Chưa cập nhật
                  </span>
                )}
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
                <div className={styles.landlordTextCol}>
                  <span className={`${styles.verifiedStatusRow} ${isAvailable ? styles.verifiedGreen : styles.verifiedGray}`}>
                    {isAvailable && <span className={`material-symbols-outlined ${styles.verifiedIcon}`}>verified</span>}
                    {isAvailable ? 'Tin đăng đã được duyệt' : 'Chờ kiểm duyệt'}
                  </span>
                </div>
              </div>

              {/* Thay nút Liên hệ bằng Xem chi tiết */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(`/rooms/${id}`); }}
                className={`${styles.contactBtn} ${isRented ? styles.contactBtnRented : styles.contactBtnNormal}`}
              >
                <span>Xem chi tiết</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </article>
    </>
  );
}