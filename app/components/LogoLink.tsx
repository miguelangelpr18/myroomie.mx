'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { clearLocationPersistence } from '@/app/lib/search/clearLocation'

export default function LogoLink() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Limpiar persistencia de ubicación
    clearLocationPersistence()

    // Disparar evento para limpiar state del GlobalSearchBar (que vive en layout y no se desmonta)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('myroomie:clear-location'))
    }

    // Siempre navegar a "/" sin params (limpio)
    e.preventDefault()
    router.push('/')
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="text-lg md:text-xl font-semibold tracking-tight leading-none select-none flex-shrink-0 hover:opacity-80 transition-opacity"
    >
      <span className="text-brand">my</span>
      <span className="text-neutral-900">roomie</span>
      <span className="text-neutral-900">.mx</span>
    </Link>
  )
}

