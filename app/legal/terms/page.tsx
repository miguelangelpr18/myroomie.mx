import Link from 'next/link'

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-neutral-500 mb-8">Última actualización: 2026-02-09</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">1. Uso del servicio</h2>
        <p className="text-neutral-600 text-sm leading-relaxed mb-3">
          MyRoomie.mx es una plataforma para publicar anuncios, buscar roomies y conectar con otras personas mediante perfiles y mensajería directa. Al usar el servicio aceptas estos términos.
        </p>
        <p className="text-neutral-600 text-sm leading-relaxed">
          Eres responsable de la información que publicas y de tus interacciones. No está permitido el contenido ilegal, engañoso o que viole derechos de terceros.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">2. Identidad y compatibilidad</h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          MyRoomie no garantiza la identidad, veracidad ni compatibilidad de los usuarios salvo que se indique explícitamente en la aplicación (por ejemplo, mediante una función de verificación activa). Es responsabilidad de cada usuario tomar sus propias precauciones al coordinar encuentros o acuerdos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">3. Funciones en desarrollo</h2>
        <p className="text-neutral-600 text-sm leading-relaxed mb-3">
          Funciones como verificación de correo, teléfono o identidad, y sistemas de reviews o valoraciones, pueden habilitarse en el futuro. Su disponibilidad será opcional y se indicará en la app cuando estén activas. No se garantiza su implementación ni plazos.
        </p>
        <p className="text-neutral-600 text-sm leading-relaxed">
          Hasta que dichas funciones estén disponibles y visibles en la plataforma, no debe asumirse que existe verificación de identidad ni historial de valoraciones.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">4. Contenido y conducta</h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          Nos reservamos el derecho de eliminar contenido o cuentas que incumplan estas condiciones o que afecten la seguridad o experiencia de otros usuarios. No intermediamos acuerdos económicos ni transacciones entre usuarios.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">5. Contacto</h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          Para dudas sobre estos términos puedes contactarnos a través de los medios indicados en la plataforma.
        </p>
      </section>

      <p className="text-sm text-neutral-500 mt-8">
        <Link href="/legal/privacy" className="text-brand hover:underline">Política de Privacidad</Link>
        {' · '}
        <Link href="/legal/safety" className="text-brand hover:underline">Seguridad y buenas prácticas</Link>
      </p>
    </div>
  )
}
