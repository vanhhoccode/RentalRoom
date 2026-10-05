import React, { useState } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

/**
 * SearchBar Component cho TroTot.vn
 */
export default function SearchBar({
  placeholder = "Tìm theo phố, quận, trường ĐH hoặc mã tin...",
  onSearch,
  className = ""
}: SearchBarProps) {
  const [keyword, setKeyword] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    if (onSearch) onSearch(value);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <div className={`${styles.searchWrapper} ${className}`}>
        <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
        <input 
          type="text"
          value={keyword}
          onChange={handleChange}
          className={styles.searchInput} 
          placeholder={placeholder} 
        />
      </div>
    </>
  );
}