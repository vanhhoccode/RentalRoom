import React from 'react';
import styles from './TextareaField.module.css';

interface TextareaFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  rows?: number;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
}

export default function TextareaField({
  label,
  placeholder = '',
  value,
  onChange,
  rows = 4,
  required = false,
  error,
  className = '',
  id,
  name
}: TextareaFieldProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
      `}</style>

      <div className={`${styles.container} ${className}`}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label} {required && <span className={styles.requiredAsterisk}>*</span>}
          </label>
        )}

        <div className={`${styles.textareaWrapper} ${error ? styles.textareaError : ''}`}>
          <textarea
            id={id}
            name={name}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={styles.textareaControl}
          />
        </div>

        {error && (
          <span className={styles.errorMessage}>{error}</span>
        )}
      </div>
    </>
  );
}