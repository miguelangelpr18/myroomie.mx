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
