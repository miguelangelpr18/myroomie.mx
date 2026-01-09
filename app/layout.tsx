import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'myroomie.mx',
  description: 'Encuentra roomie/depa con confianza',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">
              myroomie.mx
            </a>
            <nav className="flex gap-4">
              <a href="/explore" className="hover:underline">
                Explore
              </a>
              <a href="/login" className="hover:underline">
                Login
              </a>
              <a href="/signup" className="hover:underline">
                Signup
              </a>
            </nav>
          </div>
        </header>
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

