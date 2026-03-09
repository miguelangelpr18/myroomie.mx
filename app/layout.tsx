import type { Metadata } from 'next'
import './globals.css'
import Header from './Header'

export const metadata: Metadata = {
  title: {
    default: 'MyRoomie.mx — Encuentra tu roomie ideal',
    template: '%s — MyRoomie.mx',
  },
  description: 'La plataforma para encontrar roommates y habitaciones en renta en México.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    siteName: 'MyRoomie.mx',
    locale: 'es_MX',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex gap-6 justify-center">
              <a href="/legal/terms" className="hover:underline text-sm">
                Términos
              </a>
              <a href="/legal/privacy" className="hover:underline text-sm">
                Privacidad
              </a>
              <a href="/security" className="hover:underline text-sm">
                Seguridad
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}

