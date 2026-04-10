/**
 * @fileoverview 输入框组件 — Paper Garden
 * @description 通用文本输入框，支持标签、错误提示
 */

import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, size = 'md', className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-md border-2 border-border-secondary bg-bg-tertiary px-3 py-2 text-text-primary placeholder-text-tertiary transition-all duration-fast ease-smooth focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 ${sizeClasses[size]} ${error ? 'border-error focus:border-error focus:ring-error/30' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);
