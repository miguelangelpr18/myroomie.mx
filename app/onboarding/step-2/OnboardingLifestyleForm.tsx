'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveMyLifestyle, LifestyleData } from './actions'

interface OnboardingLifestyleFormProps {
  initialData?: {
    pets: boolean | null
    smoker: boolean | null
    cleanliness: number | null
    parties: boolean | null
    schedule: string | null
  }
}

export default function OnboardingLifestyleForm({ initialData }: OnboardingLifestyleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState<LifestyleData>({
    pets: initialData?.pets ?? false,
    smoker: initialData?.smoker ?? false,
    cleanliness: initialData?.cleanliness ?? null,
    parties: initialData?.parties ?? false,
    schedule: initialData?.schedule ?? null,
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      // Validaciones client-side básicas
      if (formData.cleanliness === null || formData.cleanliness === undefined) {
        setErrorMsg('El nivel de limpieza es requerido')
        setLoading(false)
        return
      }

      if (!formData.schedule || (formData.schedule !== 'day' && formData.schedule !== 'night')) {
        setErrorMsg('El horario es requerido')
        setLoading(false)
        return
      }

      const { error } = await saveMyLifestyle(formData)

      if (error) {
        setErrorMsg(error)
        setLoading(false)
        return
      }

      // Si no hay error, saveMyLifestyle hace redirect a /explore automáticamente
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar estilo de vida')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-3 font-medium">
          ¿Tienes mascotas? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="pets"
              checked={formData.pets === true}
              onChange={() => setFormData({ ...formData, pets: true })}
              required
              className="w-4 h-4"
            />
            <span>Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="pets"
              checked={formData.pets === false}
              onChange={() => setFormData({ ...formData, pets: false })}
              required
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block mb-3 font-medium">
          ¿Fumas? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="smoker"
              checked={formData.smoker === true}
              onChange={() => setFormData({ ...formData, smoker: true })}
              required
              className="w-4 h-4"
            />
            <span>Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="smoker"
              checked={formData.smoker === false}
              onChange={() => setFormData({ ...formData, smoker: false })}
              required
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="cleanliness" className="block mb-2 font-medium">
          Nivel de limpieza <span className="text-red-500">*</span>
        </label>
        <select
          id="cleanliness"
          value={formData.cleanliness ?? ''}
          onChange={(e) => setFormData({ ...formData, cleanliness: e.target.value ? parseInt(e.target.value, 10) : null })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un nivel</option>
          <option value="1">1 - Relajado</option>
          <option value="2">2 - Moderado</option>
          <option value="3">3 - Muy ordenado</option>
        </select>
      </div>

      <div>
        <label className="block mb-3 font-medium">
          ¿Organizas fiestas en casa? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="parties"
              checked={formData.parties === true}
              onChange={() => setFormData({ ...formData, parties: true })}
              required
              className="w-4 h-4"
            />
            <span>Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="parties"
              checked={formData.parties === false}
              onChange={() => setFormData({ ...formData, parties: false })}
              required
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block mb-3 font-medium">
          Horario preferido <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="schedule"
              checked={formData.schedule === 'day'}
              onChange={() => setFormData({ ...formData, schedule: 'day' })}
              required
              className="w-4 h-4"
            />
            <span>Día</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="schedule"
              checked={formData.schedule === 'night'}
              onChange={() => setFormData({ ...formData, schedule: 'night' })}
              required
              className="w-4 h-4"
            />
            <span>Noche</span>
          </label>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/onboarding/step-1"
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 text-center"
        >
          Atrás
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar y continuar'}
        </button>
      </div>
    </form>
  )
}

