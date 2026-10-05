import React from 'react';
import styles from './FormSelect.module.css';

interface SelectOption {
  value?: string | number;
  label?: string;
}

interface FormSelectProps {
  label?: string;
  options?: (SelectOption | string)[];
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  icon?: string;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
}

export default function FormSelect({
  label,
  options = [],
  value,
  onChange,
  icon,
  required = false,
  error,
  className = '',
  id,
  name
}: FormSelectProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <div className={`${styles.container} ${className}`}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label} {required && <span className={styles.requiredAsterisk}>*</span>}
          </label>
        )}

        <div className={`${styles.selectWrapper} ${error ? styles.selectError : ''}`}>
          {icon && (
            <span className={`material-symbols-outlined ${styles.iconStyle}`}>
              {icon}
            </span>
          )}

          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={styles.selectControl}
          >
            {options.map((opt, idx) => {
              if (typeof opt === 'string') {
                return <option key={idx} value={opt}>{opt}</option>;
              }
              return (
                <option key={idx} value={opt.value !== undefined ? String(opt.value) : ''}>
                  {opt.label !== undefined ? opt.label : ''}
                </option>
              );
            })}
          </select>
        </div>

        {error && (
          <span className={styles.errorMessage}>{error}</span>
        )}
      </div>
    </>
  );
}