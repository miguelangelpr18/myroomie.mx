'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Algo salió mal
          </h1>
          <p style={{ color: '#737373', fontSize: '0.875rem', maxWidth: '24rem', marginBottom: '2rem' }}>
            Ocurrió un error crítico. Intenta recargar la página.
          </p>
          <button
            onClick={() => reset()}
            style={{
              height: '2.5rem',
              padding: '0 1.25rem',
              borderRadius: '0.5rem',
              backgroundColor: '#FF7A18',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
