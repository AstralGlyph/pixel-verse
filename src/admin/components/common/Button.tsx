/**
 * @fileoverview 按钮组件 — Paper Garden
 * @description 通用按钮组件，支持多种变体和尺寸
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-fast ease-smooth focus:outline-none focus:ring-2 focus:ring-accent-primary/50';

  const variantClasses = {
    primary: 'text-white shadow-sm hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm',
    secondary: 'bg-card-bg text-text-primary border-2 border-border-primary hover:border-accent-primary/50 hover:bg-bg-secondary hover:-translate-y-[1px]',
    danger: 'bg-error text-white hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm',
    ghost: 'text-text-secondary hover:bg-bg-secondary hover:text-accent-primary',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const primaryStyle = variant === 'primary'
    ? {
        background: 'var(--gradient-primary)',
        backgroundColor: 'var(--color-accent-primary)',
        color: '#fff',
      }
    : undefined;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : ''} ${className}`}
      style={primaryStyle}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
