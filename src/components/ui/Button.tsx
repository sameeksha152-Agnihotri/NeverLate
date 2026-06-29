import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-xl
      transition-all duration-200 ease-out
      focus-visible:outline-2 focus-visible:outline-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.97]
    `;

    const variants = {
      primary: `
        text-white
        focus-visible:outline-[var(--accent-primary)]
        shadow-md
      `,
      secondary: `
        bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
        text-[var(--text-secondary)]
        hover:text-[var(--text-primary)] hover:border-[var(--border-active)]
        focus-visible:outline-[var(--accent-primary)]
      `,
      ghost: `
        bg-transparent
        text-[var(--text-secondary)]
        hover:bg-[var(--bg-nav-hover)] hover:text-[var(--text-primary)]
        focus-visible:outline-[var(--accent-primary)]
      `,
      danger: `
        bg-[color-mix(in_srgb,var(--accent-danger)_12%,transparent)]
        border border-[color-mix(in_srgb,var(--accent-danger)_30%,transparent)]
        text-[var(--accent-danger)]
        hover:bg-[color-mix(in_srgb,var(--accent-danger)_20%,transparent)]
        focus-visible:outline-[var(--accent-danger)]
      `,
      success: `
        bg-[color-mix(in_srgb,var(--accent-success)_12%,transparent)]
        border border-[color-mix(in_srgb,var(--accent-success)_30%,transparent)]
        text-[var(--accent-success)]
        hover:bg-[color-mix(in_srgb,var(--accent-success)_20%,transparent)]
        focus-visible:outline-[var(--accent-success)]
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    };

    const primaryStyle =
      variant === 'primary'
        ? {
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--accent-primary) 25%, transparent)',
          }
        : undefined;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={primaryStyle}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
