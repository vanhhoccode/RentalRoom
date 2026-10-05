import React, { useState } from 'react';
import styles from './InputField.module.css';

interface InputFieldProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  icon?: string;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
}

export default function InputField({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  icon,
  required = false,
  error,
  className = '',
  id,
  name
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

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

        <div className={`${styles.inputWrapper} ${error ? styles.inputError : ''}`}>
          {icon && (
            <span className={`material-symbols-outlined ${styles.iconStyle}`}>
              {icon}
            </span>
          )}
          
          <input
            id={id}
            name={name}
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={styles.inputControl}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.eyeButton}
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          )}
        </div>

        {error && (
          <span className={styles.errorMessage}>{error}</span>
        )}
      </div>
    </>
  );
}