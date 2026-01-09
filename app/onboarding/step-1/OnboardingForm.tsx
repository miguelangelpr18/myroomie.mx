'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { saveMyProfile, ProfileData } from './actions'

interface OnboardingFormProps {
  initialData: ProfileData | null
}

export default function OnboardingForm({ initialData }: OnboardingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [formData, setFormData] = useState<ProfileData>({
    display_name: initialData?.display_name || '',
    city: initialData?.city || '',
    zone: initialData?.zone || '',
    avatar_url: initialData?.avatar_url || '',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    try {
      // Validaciones client-side básicas
      if (!formData.display_name.trim()) {
        setErrorMsg('Display name es requerido')
        setLoading(false)
        return
      }

      if (!formData.city.trim()) {
        setErrorMsg('City es requerido')
        setLoading(false)
        return
      }

      if (!formData.zone.trim()) {
        setErrorMsg('Zone es requerido')
        setLoading(false)
        return
      }

      const { data, error } = await saveMyProfile({
        display_name: formData.display_name,
        city: formData.city,
        zone: formData.zone,
        avatar_url: formData.avatar_url || null,
      })

      if (error) {
        setErrorMsg(error)
        setLoading(false)
        return
      }

      // Éxito: redirigir a /explore
      router.push('/explore')
      router.refresh()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar perfil')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="display_name" className="block mb-2 font-medium">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="display_name"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          required
          minLength={2}
          maxLength={40}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tu nombre público"
        />
        <p className="mt-1 text-sm text-gray-500">Entre 2 y 40 caracteres</p>
      </div>

      <div>
        <label htmlFor="city" className="block mb-2 font-medium">
          Ciudad <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="city"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          required
          minLength={2}
          maxLength={60}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Ciudad de México"
        />
        <p className="mt-1 text-sm text-gray-500">Entre 2 y 60 caracteres</p>
      </div>

      <div>
        <label htmlFor="zone" className="block mb-2 font-medium">
          Zona/Colonia <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="zone"
          value={formData.zone}
          onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
          required
          minLength={2}
          maxLength={80}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Roma Norte, Polanco, etc."
        />
        <p className="mt-1 text-sm text-gray-500">Entre 2 y 80 caracteres</p>
      </div>

      <div>
        <label htmlFor="avatar_url" className="block mb-2 font-medium">
          Avatar URL (opcional)
        </label>
        <input
          type="url"
          id="avatar_url"
          value={formData.avatar_url}
          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://ejemplo.com/avatar.jpg"
        />
        <p className="mt-1 text-sm text-gray-500">URL de tu imagen de perfil</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Guardando...' : 'Guardar perfil'}
      </button>
    </form>
  )
}

