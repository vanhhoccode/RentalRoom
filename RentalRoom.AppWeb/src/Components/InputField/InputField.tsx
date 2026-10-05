import React, { InputHTMLAttributes } from 'react';
import styles from './InputField.module.css';

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    required?: boolean;
    helperTextTop?: string; // Text phụ nằm ngang hàng với label (ví dụ: "68/100 ký tự")
    leftIcon?: string;
    rightSuffix?: string;   // Ví dụ: "đ/tháng", "m²"
    errorMsg?: string;
    multiline?: boolean;    // Nếu true -> render thẻ textarea
    rows?: number;
}

export default function InputField({
    label,
    required,
    helperTextTop,
    leftIcon,
    rightSuffix,
    errorMsg,
    multiline = false,
    rows = 4,
    className = '',
    ...props
}: InputFieldProps) {

    const hasError = !!errorMsg;

    // Build input classes
    let inputClasses = `${styles.inputBase} ${hasError ? styles.inputError : ''}`;
    if (leftIcon) inputClasses += ` ${styles.hasLeftIcon}`;
    if (rightSuffix) inputClasses += ` ${styles.hasRightText}`;

    return (
        <div className={`${styles.wrapper} ${className}`}>

            {/* Label Row */}
            <div className={styles.labelRow}>
                <label className={styles.label}>
                    {label} {required && <span className={styles.required}>*</span>}
                </label>
                {helperTextTop && <span className={styles.helperTextTop}>{helperTextTop}</span>}
            </div>

            {/* Input Area */}
            <div className={styles.inputContainer}>
                {leftIcon && (
                    <span className={`material-symbols-outlined ${styles.leftIcon}`}>{leftIcon}</span>
                )}

                {multiline ? (
                    <textarea
                        className={inputClasses}
                        rows={rows}
                        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                ) : (
                    <input
                        className={inputClasses}
                        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                    />
                )}

                {rightSuffix && (
                    <span className={styles.rightText}>{rightSuffix}</span>
                )}
            </div>

            {/* Error Message */}
            {hasError && (
                <span className={styles.errorMsg}>
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errorMsg}
                </span>
            )}
        </div>
    );
}