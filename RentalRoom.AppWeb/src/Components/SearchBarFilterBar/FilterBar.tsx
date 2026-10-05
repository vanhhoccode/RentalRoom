import { useState } from 'react';
import styles from './FilterBar.module.css';

interface City {
  id: string;
  name: string;
}

interface Amenity {
  id: string;
  label: string;
  icon: string;
}

interface StatusOption {
  id: string;
  label: string;
}

interface SortOption {
  id: string;
  label: string;
}

interface FilterChangePayload {
  amenities: string[];
}

interface SubmitPayload {
  selectedCity: string;
  selectedPrice: string;
  selectedType: string;
  activeAmenities: string[];
}

interface FilterBarProps {
  variant?: 'home' | 'management';
  cities?: City[];
  priceRanges?: string[];
  propertyTypes?: string[];
  amenities?: Amenity[];
  statuses?: StatusOption[];
  sorts?: SortOption[];
  onFilterChange?: (payload: FilterChangePayload) => void;
  onSubmit?: (payload: SubmitPayload) => void;
}

/**
 * FilterBar Component cho TroTot.vn
 */
export default function FilterBar({
  variant = 'home',
  cities = [
    { id: 'hn', name: 'Hà Nội (Thủ đô)' },
    { id: 'hcm', name: 'TP. Hồ Chí Minh' },
    { id: 'dn', name: 'Đà Nẵng' }
  ],
  priceRanges = ['Tất cả mức giá', 'Dưới 3 triệu', '3 - 5 triệu', '5 - 8 triệu', 'Trên 8 triệu'],
  propertyTypes = ['Tất cả loại phòng', 'Chung cư mini', 'Phòng trọ khép kín', 'Căn hộ dịch vụ', 'Ở ghép / KTX tiện nghi'],
  amenities = [
    { id: 'ac', label: 'Có máy lạnh', icon: 'ac_unit' },
    { id: 'wc', label: 'Vệ sinh riêng', icon: 'water_damage' },
    { id: 'laundry', label: 'Máy giặt riêng', icon: 'local_laundry_service' }
  ],
  statuses = [{ id: 'all', label: 'Tất cả trạng thái' }, { id: 'available', label: 'Đang còn trống' }],
  sorts = [{ id: 'recent', label: 'Mới lưu gần đây' }, { id: 'price-asc', label: 'Giá thấp đến cao' }],
  onFilterChange,
  onSubmit
}: FilterBarProps) {
  const [selectedCity, setSelectedCity] = useState(cities[0]?.id || '');
  const [selectedPrice, setSelectedPrice] = useState(priceRanges[0] || '');
  const [selectedType, setSelectedType] = useState(propertyTypes[0] || '');
  const [selectedStatus, setSelectedStatus] = useState(statuses[0]?.id || '');
  const [selectedSort, setSelectedSort] = useState(sorts[0]?.id || '');
  const [activeAmenities, setActiveAmenities] = useState<string[]>([]);

  const handleAmenityClick = (id: string) => {
    const updated = activeAmenities.includes(id) 
      ? activeAmenities.filter(item => item !== id) 
      : [...activeAmenities, id];
    setActiveAmenities(updated);
    if (onFilterChange) onFilterChange({ amenities: updated });
  };

  if (variant === 'home') {
    return (
      <div className={styles.homeFilterContainer}>
        <div className={styles.filterGrid}>
          {/* Thành phố */}
          <div className={`lg:col-span-4 ${styles.filterBox}`}>
            <span className={styles.filterLabel}>Tỉnh / Thành phố</span>
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={styles.filterSelect}
            >
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Mức giá */}
          <div className={`lg:col-span-4 ${styles.filterBox}`}>
            <span className={styles.filterLabel}>Khoảng giá</span>
            <select 
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className={styles.filterSelect}
            >
              {priceRanges.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Loại phòng */}
          <div className={`lg:col-span-4 ${styles.filterBox}`}>
            <span className={styles.filterLabel}>Loại hình</span>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={styles.filterSelect}
            >
              {propertyTypes.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Tiện ích và Nút submit */}
        <div className={styles.bottomRow}>
          <div className={styles.amenitiesGroup}>
            {amenities.map(a => {
              const active = activeAmenities.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleAmenityClick(a.id)}
                  className={`${styles.amenityChip} ${active ? styles.chipActive : styles.chipInactive}`}
                >
                  <span className="material-symbols-outlined text-[16px]">{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>

          <button 
            type="button"
            onClick={() => onSubmit && onSubmit({ selectedCity, selectedPrice, selectedType, activeAmenities })}
            className={styles.submitBtn}
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            <span>Áp dụng lọc</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.managementFilterContainer}>
      <div className={styles.dropdownBox}>
        <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>filter_list</span>
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={styles.dropdownSelect}
        >
          {statuses.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
        </select>
      </div>

      <div className={styles.dropdownBox}>
        <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>sort</span>
        <select 
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className={styles.dropdownSelect}
        >
          {sorts.map(so => <option key={so.id} value={so.id}>{so.label}</option>)}
        </select>
      </div>
    </div>
  );
}