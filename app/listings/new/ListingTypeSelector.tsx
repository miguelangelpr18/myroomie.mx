'use client'

interface ListingTypeCardProps {
  type: 'solo_renta' | 'buscar_roomie'
  selected: boolean
  onSelect: () => void
}

export default function ListingTypeSelector({
  selectedType,
  onSelect,
}: {
  selectedType: 'solo_renta' | 'buscar_roomie' | null
  onSelect: (type: 'solo_renta' | 'buscar_roomie') => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          ¿Qué tipo de anuncio quieres crear?
        </h2>
        <p className="text-neutral-600">
          Selecciona la opción que mejor describa tu situación
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Opción A: Solo Renta */}
        <button
          type="button"
          onClick={() => onSelect('solo_renta')}
          className={`relative p-6 rounded-2xl border-2 transition-all text-left group hover:shadow-lg ${
            selectedType === 'solo_renta'
              ? 'border-brand bg-brandSoft ring-2 ring-brand/20'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          {selectedType === 'solo_renta' && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="flex flex-col h-full">
            <div className="mb-4 w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-brand"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Rento un espacio
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Tengo un cuarto, departamento o casa disponible para rentar. Me enfoco en las características del inmueble.
            </p>

            <div className="mt-auto pt-4 border-t border-neutral-200">
              <p className="text-xs text-neutral-500">
                ✓ Enfoque en la propiedad<br />
                ✓ Ideal para propietarios o arrendadores
              </p>
            </div>
          </div>
        </button>

        {/* Opción B: Buscar Roomie */}
        <button
          type="button"
          onClick={() => onSelect('buscar_roomie')}
          className={`relative p-6 rounded-2xl border-2 transition-all text-left group hover:shadow-lg ${
            selectedType === 'buscar_roomie'
              ? 'border-brand bg-brandSoft ring-2 ring-brand/20'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          {selectedType === 'buscar_roomie' && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="flex flex-col h-full">
            <div className="mb-4 w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-brand"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Busco un roomie
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Quiero compartir mi espacio con alguien compatible. Me interesa encontrar a la persona ideal para convivir.
            </p>

            <div className="mt-auto pt-4 border-t border-neutral-200">
              <p className="text-xs text-neutral-500">
                ✓ Enfoque en la convivencia<br />
                ✓ Incluye perfil de compatibilidad
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
