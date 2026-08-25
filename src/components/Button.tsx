import type { ButtonHTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cx } from '../lib/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
): string {
  const base =
    'group inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50'
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-signal text-ink shadow-[0_12px_38px_rgba(199,255,103,.12)] hover:-translate-y-0.5 hover:bg-[#d4ff8e] active:translate-y-0',
    secondary:
      'border border-white/[0.12] bg-white/[0.055] text-paper hover:-translate-y-0.5 hover:border-white/[0.22] hover:bg-white/[0.09] active:translate-y-0',
    ghost: 'text-paper/[0.80] hover:bg-white/[0.06] hover:text-paper',
    danger:
      'bg-coral text-ink shadow-[0_12px_38px_rgba(255,117,105,.12)] hover:-translate-y-0.5 hover:bg-[#ff9188] active:translate-y-0',
  }
  const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-3.5 text-xs',
    md: 'h-11 px-4 text-sm',
    lg: 'h-[3.25rem] px-5 text-sm sm:px-6',
  }
  return cx(base, variants[variant], sizes[size])
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(buttonStyles(variant, size), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
