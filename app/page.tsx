export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">
          Encuentra roomie/depa con confianza
        </h1>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/signup"
            className="bg-[#FF7A18] text-white px-6 py-3 rounded-lg hover:bg-[#E86F14]"
          >
            Crear perfil
          </a>
          <a
            href="/explore"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Explorar
          </a>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Verificación</h2>
          <p className="text-gray-600">
            Perfiles verificados para mayor seguridad
          </p>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Reviews</h2>
          <p className="text-gray-600">
            Evaluaciones de usuarios reales
          </p>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Seguridad</h2>
          <p className="text-gray-600">
            Protección de datos y transacciones
          </p>
        </div>
      </section>
    </div>
  )
}

