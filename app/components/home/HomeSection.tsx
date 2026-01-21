import Link from 'next/link'
import { ReactNode } from 'react'

interface HomeSectionProps {
  title: string
  description?: string
  rightCtaLabel?: string
  rightCtaHref?: string
  children: ReactNode
}

export default function HomeSection({
  title,
  description,
  rightCtaLabel,
  rightCtaHref,
  children,
}: HomeSectionProps) {
  return (
    <div className="mt-10">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold tracking-tight text-neutral-900">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-neutral-600">{description}</p>
          )}
        </div>
        {rightCtaLabel && rightCtaHref && (
          <Link
            href={rightCtaHref}
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            {rightCtaLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

