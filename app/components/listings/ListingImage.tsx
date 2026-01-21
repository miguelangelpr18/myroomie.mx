'use client'

import { useState, ReactNode } from 'react'

interface ListingImageProps {
  src?: string | null
  alt: string
  className?: string
  wrapperClassName?: string
  fallback?: ReactNode
}

export default function ListingImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallback,
}: ListingImageProps) {
  const [errored, setErrored] = useState(false)

  // Si no hay src o está vacío, mostrar placeholder
  if (!src || src.trim() === '' || errored) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-500 ${wrapperClassName}`}>
        {fallback || (
          <>
            <div className="text-3xl">🖼️</div>
            <div className="text-xs font-medium">Sin foto</div>
          </>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  )
}

