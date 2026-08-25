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
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 disabled:pointer-events-none disabled:opacity-50'
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-signal text-ink hover:bg-[#1f5aef] active:bg-[#1a4fd6]',
    secondary: 'border border-black/[0.12] bg-white text-paper hover:bg-mist',
    ghost: 'text-muted hover:text-paper',
    danger: 'bg-coral text-ink hover:bg-[#c0143a] active:bg-[#a31132]',
  }
  const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-[0.95rem]',
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
