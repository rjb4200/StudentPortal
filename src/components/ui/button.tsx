'use client';

import { type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'sage';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-wfd-crimson text-white hover:brightness-90 focus:ring-wfd-crimson',
  secondary: 'bg-wfd-charcoal text-white hover:brightness-125 focus:ring-wfd-charcoal',
  danger: 'bg-wfd-crimson text-white hover:brightness-90 focus:ring-wfd-crimson',
  sage: 'bg-wfd-sage text-white hover:brightness-90 focus:ring-wfd-sage',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  loading?: boolean;
}

const sizeStyles: Record<'sm' | 'md', string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`${sizeStyles[size]} rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
