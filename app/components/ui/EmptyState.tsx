import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  icon?: 'search' | 'messages' | 'listings' | 'profile'
  variant?: 'default' | 'compact'
}

export default function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  icon,
  variant = 'default',
}: EmptyStateProps) {
  const iconEmoji = {
    search: '🔎',
    messages: '💬',
    listings: '🏠',
    profile: '👤',
  }

  const emoji = icon ? iconEmoji[icon] : null
  const isCompact = variant === 'compact'

  return (
    <div
      className={
        isCompact
          ? 'rounded-xl border border-neutral-200 bg-white p-5 text-center'
          : 'rounded-xl border border-neutral-200 bg-white p-8 text-center'
      }
    >
      {emoji && (
        <div className={isCompact ? 'text-2xl' : 'text-3xl'}>{emoji}</div>
      )}
      <h2
        className={
          isCompact
            ? 'mt-3 text-base font-medium text-neutral-900'
            : 'mt-3 text-lg font-medium text-neutral-900'
        }
      >
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-neutral-600">{description}</p>
      )}
      {ctaLabel && ctaHref && (
        <div className="mt-4">
          <Link
            href={ctaHref}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-brandHover transition-colors focus:outline-none focus:ring-2 focus:ring-brandBorder focus:ring-offset-2"
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </div>
  )
}

