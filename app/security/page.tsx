import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seguridad',
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Seguridad</h1>
      <p className="text-neutral-500 mb-10">
        Tu seguridad es nuestra prioridad. Sigue estas recomendaciones para tener una experiencia
        segura en MyRoomie.mx.
      </p>

      <div className="space-y-10">
        {/* Sección 1 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand/10 text-brand text-lg font-bold">
              1
            </span>
            <h2 className="text-xl font-semibold">Antes de reunirte en persona</h2>
          </div>
          <ul className="space-y-2 text-neutral-700 pl-12 list-disc">
            <li>
              Realiza una <strong>videollamada previa</strong> antes de agendar una visita al cuarto o
              depa. Confirma que la persona es quien dice ser.
            </li>
            <li>
              Elige siempre un <strong>lugar público</strong> para el primer encuentro si es posible
              (un café, plaza, etc.).
            </li>
            <li>
              Avísale a alguien de confianza a dónde vas, con quién y a qué hora planeas regresar.
            </li>
          </ul>
        </section>

        {/* Sección 2 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 text-red-600 text-lg font-bold">
              !
            </span>
            <h2 className="text-xl font-semibold">Señales de alerta</h2>
          </div>
          <ul className="space-y-2 text-neutral-700 pl-12 list-disc">
            <li>
              <strong>Pide dinero o depósito antes de que puedas ver el lugar en persona.</strong> Nunca
              pagues sin haber visitado el espacio físicamente.
            </li>
            <li>
              <strong>Se niega a hacer videollamada</strong> o siempre tiene una excusa para no mostrarte
              el cuarto.
            </li>
            <li>
              <strong>Te presiona para tomar una decisión rápida</strong> o dice que hay muchos interesados
              para apresurar el pago.
            </li>
            <li>
              El precio es significativamente más bajo que el mercado sin justificación clara.
            </li>
          </ul>
        </section>

        {/* Sección 3 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand/10 text-brand text-lg font-bold">
              $
            </span>
            <h2 className="text-xl font-semibold">Pagos seguros</h2>
          </div>
          <ul className="space-y-2 text-neutral-700 pl-12 list-disc">
            <li>
              <strong>Nunca transfieras dinero sin haber visto el lugar físicamente</strong> y hablar
              en persona con el propietario o arrendatario.
            </li>
            <li>
              Exige siempre un <strong>contrato escrito</strong> firmado por ambas partes antes de
              hacer cualquier pago (depósito, primer mes, etc.).
            </li>
            <li>
              Guarda los comprobantes de todos tus pagos: transferencias, depósitos, recibos.
            </li>
          </ul>
        </section>

        {/* Sección 4 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand/10 text-brand text-lg font-bold">
              ✉
            </span>
            <h2 className="text-xl font-semibold">Cómo reportar</h2>
          </div>
          <p className="text-neutral-700 pl-12 mb-3">
            Si encontraste un perfil sospechoso, un anuncio fraudulento o tuviste una mala
            experiencia, repórtalo de inmediato a nuestro equipo.
          </p>
          <div className="pl-12">
            <a
              href="mailto:soporte@myroomie.mx?subject=Reporte%20de%20seguridad"
              className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brandHover transition-colors"
            >
              Contactar soporte
            </a>
          </div>
        </section>

        {/* Sección 5 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand/10 text-brand text-lg font-bold">
              ✓
            </span>
            <h2 className="text-xl font-semibold">Nuestro compromiso</h2>
          </div>
          <ul className="space-y-2 text-neutral-700 pl-12 list-disc">
            <li>
              Todos los perfiles pasan por un proceso de <strong>verificación de identidad</strong>{' '}
              (en desarrollo) para reducir cuentas falsas.
            </li>
            <li>
              Contamos con un <strong>equipo de moderación</strong> que revisa reportes y puede
              suspender cuentas que violen nuestras políticas de uso.
            </li>
            <li>
              Seguimos mejorando continuamente nuestras herramientas de seguridad para proteger a
              toda nuestra comunidad.
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-12 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-600 text-center">
        ¿Tienes dudas sobre seguridad?{' '}
        <a href="mailto:soporte@myroomie.mx" className="text-brand hover:underline font-medium">
          Escríbenos
        </a>
      </div>
    </div>
  )
}
