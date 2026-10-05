import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

/**
 * Button & ActionButton Component cho TroTot.vn
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  children,
  disabled = false,
  type = 'button',
  title
}: ButtonProps) {
  // Map biến thể màu sắc sang CSS Modules
  const variantStyles: Record<string, string> = {
    primary: styles.primaryVariant,
    secondary: styles.secondaryVariant,
    danger: styles.dangerVariant
  };

  // Map kích thước sang CSS Modules
  const sizeStyles: Record<string, string> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        title={title}
        className={`
          ${styles.baseButton}
          ${variantStyles[variant] || styles.primaryVariant}
          ${sizeStyles[size] || styles.sizeMd}
          ${fullWidth ? styles.fullWidth : styles.autoWidth}
          ${className}
        `}
      >
        {/* Icon nằm bên trái */}
        {icon && iconPosition === 'left' && (
          <span className={`material-symbols-outlined ${styles.iconStyle}`}>
            {icon}
          </span>
        )}
        {/* Nội dung chữ */}
        <span>{children}</span>
        {/* Icon nằm bên phải */}
        {icon && iconPosition === 'right' && (
          <span className={`material-symbols-outlined ${styles.iconStyle}`}>
            {icon}
          </span>
        )}
      </button>
    </>
  );
}