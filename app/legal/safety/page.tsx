import Link from 'next/link'

export default function Safety() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Seguridad y buenas prácticas</h1>
      <p className="text-sm text-neutral-500 mb-8">Última actualización: 2026-02-09</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">Sobre la identidad en la plataforma</h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          MyRoomie no verifica la identidad de los usuarios a menos que se indique explícitamente en la aplicación (por ejemplo, mediante una función de verificación activa y visible). No debes asumir que un perfil está verificado salvo que la app lo señale.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">Buenas prácticas</h2>
        <ul className="list-disc list-inside text-neutral-600 text-sm leading-relaxed space-y-2">
          <li>Revisa perfiles y preferencias antes de coordinar.</li>
          <li>Usa la mensajería de la plataforma para conocerte antes de compartir datos personales externos.</li>
          <li>Te recomendamos hacer videollamada y, cuando te sientas cómodo, conocer en persona antes de acordar convivencia o pagos.</li>
          <li>No envíes dinero por medios externos a personas que no conozcas; la plataforma no interviene en transacciones entre usuarios.</li>
          <li>Si algo te resulta sospechoso, reporta o deja de interactuar y contacta a las autoridades si corresponde.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">Emergencias</h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          En caso de emergencia o situación que requiera intervención de autoridades, contacta a los servicios locales correspondientes (policía, emergencias). MyRoomie no puede actuar como autoridad ni garantizar respuestas de terceros.
        </p>
      </section>

      <p className="text-sm text-neutral-500 mt-8">
        <Link href="/legal/terms" className="text-brand hover:underline">Términos y Condiciones</Link>
        {' · '}
        <Link href="/legal/privacy" className="text-brand hover:underline">Política de Privacidad</Link>
      </p>
    </div>
  )
}
