'use client'

export interface LifestylePrefs {
  occupation?: string
  desired_vibe?: string
  smoking?: boolean
  pets?: boolean
  visitors?: 'frequent' | 'occasional' | 'rare'
  cleanliness?: number // 1-5
  noise_tolerance?: number // 1-5
}

interface ConvivenciaProfileProps {
  data: LifestylePrefs
  onChange: (data: LifestylePrefs) => void
}

export default function ConvivenciaProfile({ data, onChange }: ConvivenciaProfileProps) {
  return (
    <div className="space-y-6 p-6 bg-brandSoft/30 rounded-2xl border border-brandBorder">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Perfil de Convivencia</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Comparte información sobre ti y el ambiente que buscas. Esto ayudará a encontrar al roomie perfecto.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Ocupación */}
        <div>
          <label htmlFor="occupation" className="block mb-2 font-medium text-neutral-700">
            ¿A qué te dedicas?
          </label>
          <input
            type="text"
            id="occupation"
            value={data.occupation || ''}
            onChange={(e) => onChange({ ...data, occupation: e.target.value })}
            placeholder="Ej: Estudiante de medicina, Ingeniero de software..."
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Ambiente deseado */}
        <div>
          <label htmlFor="desired_vibe" className="block mb-2 font-medium text-neutral-700">
            ¿Qué ambiente buscas?
          </label>
          <textarea
            id="desired_vibe"
            value={data.desired_vibe || ''}
            onChange={(e) => onChange({ ...data, desired_vibe: e.target.value })}
            placeholder="Ej: Ambiente tranquilo para estudiar, gente social y amigable..."
            rows={3}
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Hábitos: Fumar */}
        <div>
          <label className="block mb-2 font-medium text-neutral-700">¿Fumas?</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...data, smoking: false })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-colors ${
                data.smoking === false
                  ? 'border-brand bg-brand/5 text-brand font-medium'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              No fumo
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, smoking: true })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-colors ${
                data.smoking === true
                  ? 'border-brand bg-brand/5 text-brand font-medium'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Sí fumo
            </button>
          </div>
        </div>

        {/* Hábitos: Mascotas */}
        <div>
          <label className="block mb-2 font-medium text-neutral-700">¿Tienes mascotas?</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...data, pets: false })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-colors ${
                data.pets === false
                  ? 'border-brand bg-brand/5 text-brand font-medium'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              No tengo
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, pets: true })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-colors ${
                data.pets === true
                  ? 'border-brand bg-brand/5 text-brand font-medium'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Sí tengo
            </button>
          </div>
        </div>

        {/* Visitas */}
        <div>
          <label className="block mb-2 font-medium text-neutral-700">¿Con qué frecuencia recibes visitas?</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...data, visitors: 'rare' })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-colors text-sm ${
                data.visitors === 'rare'
                  ? 'border-brand bg-brand/5 text-brand font-medium'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Rara vez
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, visitors: 'occasional' })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-colors text-sm ${
                data.visitors === 'occasional'
                  ? 'border-brand bg-brand/5 text-brand font-medium'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Ocasionalmente
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, visitors: 'frequent' })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-colors text-sm ${
                data.visitors === 'frequent'
                  ? 'border-brand bg-brand/5 text-brand font-medium'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Frecuentemente
            </button>
          </div>
        </div>

        {/* Limpieza */}
        <div>
          <label className="block mb-2 font-medium text-neutral-700">
            Nivel de limpieza (1 = flexible, 5 = muy ordenado)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ ...data, cleanliness: level })}
                className={`flex-1 h-12 rounded-xl border transition-all ${
                  data.cleanliness === level
                    ? 'border-brand bg-brand text-white font-semibold'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Tolerancia al ruido */}
        <div>
          <label className="block mb-2 font-medium text-neutral-700">
            Tolerancia al ruido (1 = silencio total, 5 = muy tolerante)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ ...data, noise_tolerance: level })}
                className={`flex-1 h-12 rounded-xl border transition-all ${
                  data.noise_tolerance === level
                    ? 'border-brand bg-brand text-white font-semibold'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            <strong>Consejo:</strong> Ser honesto sobre tus hábitos y preferencias ayuda a encontrar al roomie ideal y evita conflictos futuros.
          </p>
        </div>
      </div>
    </div>
  )
}
