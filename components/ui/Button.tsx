// components/ui/Button.tsx
'use client'

import { forwardRef } from 'react'
import { buttonClass, type ButtonVariant } from './variants'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', loading = false, disabled, className, children, ...rest },
  ref,
) {
  const cls = [buttonClass(variant), className].filter(Boolean).join(' ')
  return (
    <button ref={ref} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {children}
    </button>
  )
})
