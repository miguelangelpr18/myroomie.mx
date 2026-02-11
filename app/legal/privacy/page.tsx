import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-neutral-500 mb-8">Última actualización: 2026-02-09</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">1. Datos que recabamos</h2>
        <p className="text-neutral-600 text-sm leading-relaxed mb-3">
          Para el registro y uso del servicio utilizamos, entre otros, correo electrónico, contraseña y la información que decidas incluir en tu perfil (nombre, preferencias, fotos, etc.). Los datos de mensajería se almacenan para permitir las conversaciones dentro de la plataforma.
        </p>
        <p className="text-neutral-600 text-sm leading-relaxed">
          En el futuro podría solicitarse información adicional (por ejemplo, número de teléfono o validación de identidad) solo si se implementan funciones que así lo requieran. En ese caso se informará en la app y, cuando aplique, en esta política.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">2. Uso de los datos</h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          Utilizamos tus datos para operar el servicio (cuenta, perfiles, mensajes, búsquedas y filtros), mejorar la plataforma y cumplir obligaciones legales. No vendemos tus datos personales a terceros para fines de marketing.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">3. Compartir datos</h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          La información de tu perfil y anuncios es visible según la configuración del servicio (por ejemplo, a otros usuarios registrados). Solo compartimos datos con terceros cuando sea necesario para el funcionamiento del servicio (por ejemplo, infraestructura técnica) o cuando la ley lo exija.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">4. Derechos y contacto</h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          Puedes acceder, corregir o solicitar la eliminación de tu información desde tu cuenta o contactándonos. Para más detalles sobre el tratamiento de datos personales, puedes escribirnos a través de los medios indicados en la plataforma.
        </p>
      </section>

      <p className="text-sm text-neutral-500 mt-8">
        <Link href="/legal/terms" className="text-brand hover:underline">Términos y Condiciones</Link>
        {' · '}
        <Link href="/legal/safety" className="text-brand hover:underline">Seguridad y buenas prácticas</Link>
      </p>
    </div>
  )
}
