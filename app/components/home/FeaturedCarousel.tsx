'use client'

import { useRef, useState, useLayoutEffect } from 'react'

interface FeaturedCarouselProps {
  children: React.ReactNode
}

export default function FeaturedCarousel({ children }: FeaturedCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [ready, setReady] = useState(false)

  const update = () => {
    const el = scrollContainerRef.current
    if (!el) return

    const max = el.scrollWidth - el.clientWidth

    const styles = window.getComputedStyle(el)
    const paddingLeft = Number.parseFloat(styles.paddingLeft || '0') || 0
    const paddingRight = Number.parseFloat(styles.paddingRight || '0') || 0

    setCanScrollLeft(el.scrollLeft > paddingLeft + 2)
    setCanScrollRight(el.scrollLeft < max - paddingRight - 2)

    setReady(true)
  }

  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Force scroll to start at 0
    container.scrollLeft = 0

    // Initial update with double RAF to ensure layout is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        update()
      })
    })

    // Wait for fonts to load if available
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            update()
          })
        })
      })
    }

    // Listen to scroll events
    container.addEventListener('scroll', update)
    
    // Check on resize
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          update()
        })
      })
    })
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', update)
      resizeObserver.disconnect()
    }
  }, [children])

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleScrollLeft = () => {
    if (!scrollContainerRef.current || !canScrollLeft) return
    const container = scrollContainerRef.current
    const cardWidth = container.querySelector('[data-carousel-item]')?.clientWidth || 280
    const gap = 16 // gap-4 = 16px
    const scrollAmount = (cardWidth + gap) * 3 // Scroll ~3 cards
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }

  const handleScrollRight = () => {
    if (!scrollContainerRef.current || !canScrollRight) return
    const container = scrollContainerRef.current
    const cardWidth = container.querySelector('[data-carousel-item]')?.clientWidth || 280
    const gap = 16 // gap-4 = 16px
    const scrollAmount = (cardWidth + gap) * 3 // Scroll ~3 cards
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Carousel Container - Must come first in DOM for proper stacking */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 md:-mx-6 md:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Left Arrow - Only show when ready and can scroll left */}
      {ready && canScrollLeft && (
        <button
          type="button"
          onPointerDown={stop}
          onClick={(e) => { stop(e); handleScrollLeft() }}
          aria-label="Scroll left"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 hidden md:flex opacity-100 hover:bg-neutral-50 cursor-pointer pointer-events-auto"
        >
          <svg
            className="w-5 h-5 text-neutral-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Right Arrow - Only show when ready and can scroll right */}
      {ready && canScrollRight && (
        <button
          type="button"
          onPointerDown={stop}
          onClick={(e) => { stop(e); handleScrollRight() }}
          aria-label="Scroll right"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 hidden md:flex opacity-100 hover:bg-neutral-50 cursor-pointer pointer-events-auto"
        >
          <svg
            className="w-5 h-5 text-neutral-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
