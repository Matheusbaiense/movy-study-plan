// components/ui/variants.ts
export type ButtonVariant = 'primary' | 'secondary' | 'icon'

const MAP: Record<ButtonVariant, string> = {
  primary: 'button-fill-primary-md',
  secondary: 'button-outline-secondary-md',
  icon: 'button-blank-secondary-icon',
}

export function buttonClass(variant: ButtonVariant): string {
  return MAP[variant] ?? MAP.secondary
}
