'use client'

import { useState, useCallback, useEffect } from 'react'
import ListingImage from './ListingImage'

interface ListingGalleryProps {
  photos: string[]
  title: string
}

export default function ListingGallery({ photos, title }: ListingGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const total = photos.length
  const hasPrev = current > 0
  const hasNext = current < total - 1

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(0, c - 1))
  }, [])

  const next = useCallback(() => {
    setCurrent((c) => Math.min(total - 1, c + 1))
  }, [total])

  const openLightbox = (index: number) => {
    setCurrent(index)
    setLightboxOpen(true)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, prev, next])

  if (total === 0) {
    return (
      <div className="mb-6 aspect-[16/10] w-full rounded-xl border border-neutral-200 bg-neutral-100 flex flex-col items-center justify-center text-neutral-400">
        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-neutral-500">Este anuncio aún no tiene fotos</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        {/* Main image with arrows */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 cursor-pointer group"
          onClick={() => openLightbox(current)}
        >
          <ListingImage
            src={photos[current]}
            alt={`${title} — foto ${current + 1}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            wrapperClassName="h-full"
          />

          {/* Counter */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {current + 1} / {total}
          </div>

          {/* Prev/Next arrows */}
          {total > 1 && (
            <>
              {hasPrev && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Foto anterior"
                >
                  <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {hasNext && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Siguiente foto"
                >
                  <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {total > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {photos.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current ? 'border-brand' : 'border-transparent opacity-60 hover:opacity-90'
                }`}
                aria-label={`Ver foto ${i + 1}`}
              >
                <ListingImage
                  src={url}
                  alt={`${title} thumb ${i + 1}`}
                  className="w-full h-full object-cover"
                  wrapperClassName="h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[current]}
              alt={`${title} — foto ${current + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full">
              {current + 1} / {total}
            </div>

            {hasPrev && (
              <button
                type="button"
                onClick={prev}
                className="absolute left-0 -translate-x-12 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Foto anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {hasNext && (
              <button
                type="button"
                onClick={next}
                className="absolute right-0 translate-x-12 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Siguiente foto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
