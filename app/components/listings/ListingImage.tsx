'use client'

import { useState, ReactNode } from 'react'
import Image from 'next/image'

interface ListingImageProps {
  src?: string | null
  alt: string
  className?: string
  wrapperClassName?: string
  fallback?: ReactNode
  fill?: boolean
  width?: number
  height?: number
}

export default function ListingImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallback,
  fill = false,
  width,
  height,
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

  // Si fill es true, usar fill layout
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        onError={() => setErrored(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    )
  }

  // Si se proveen width y height, usarlos
  if (width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setErrored(true)}
      />
    )
  }

  // Fallback: usar dimensiones por defecto
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}

