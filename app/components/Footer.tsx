import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-neutral-900">MyRoomie.mx</span>
            </Link>
            <p className="text-sm text-neutral-500 max-w-[240px]">
              La plataforma para encontrar roommates y habitaciones en renta en México.
            </p>
          </div>

          {/* Explorar */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Explorar</h3>
            <ul className="space-y-2">
              <li><Link href="/explore" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Roomies</Link></li>
              <li><Link href="/listings" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Anuncios</Link></li>
              <li><Link href="/listings/new" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Publicar anuncio</Link></li>
              <li><Link href="/saved" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Guardados</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/legal/terms" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Términos de uso</Link></li>
              <li><Link href="/legal/privacy" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Privacidad</Link></li>
              <li><Link href="/security" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Seguridad</Link></li>
            </ul>
          </div>

          {/* Ciudades */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Ciudades</h3>
            <ul className="space-y-2">
              <li><Link href="/listings?city=Monterrey" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Monterrey</Link></li>
              <li><Link href="/listings?city=Ciudad de México" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Ciudad de México</Link></li>
              <li><Link href="/listings?city=Guadalajara" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Guadalajara</Link></li>
              <li><Link href="/listings?city=Puebla" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Puebla</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">
            © {year} MyRoomie.mx · Hecho en México 🇲🇽
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
              </svg>
            </a>
            <a
              href="mailto:hola@myroomie.mx"
              aria-label="Email"
              className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              hola@myroomie.mx
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
