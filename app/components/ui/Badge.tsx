// Simple className merge utility
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'subtle' | 'featured'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'border-neutral-200 text-neutral-700 bg-white',
    subtle: 'border-transparent bg-neutral-100 text-neutral-700',
    featured: 'border-orange-200 bg-orange-50 text-orange-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

