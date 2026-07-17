'use client';

import { type InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={[ariaDescribedBy, error && errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? true : undefined}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-wfd-crimson focus:border-transparent outline-none text-gray-900 ${
            error ? 'border-wfd-crimson' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && <p id={errorId} className="mt-1 text-sm text-wfd-crimson">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
