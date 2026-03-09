'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { updateListing, UpdateListingData } from '../actions'

interface EditListingFormProps {
  listing: {
    id: string
    title: string
    description: string
    city: string
    zone: string
    price_mxn: number | null
    listing_type: 'room' | 'roommate'
    location_id: string | null
    listing_subtype: string | null
    amenities: string[] | null
    is_active: boolean
  }
}

export default function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [formData, setFormData] = useState<UpdateListingData>({
    title: listing.title,
    description: listing.description,
    city: listing.city,
    zone: listing.zone,
    price_mxn: listing.price_mxn,
    listing_type: listing.listing_type,
    location_id: listing.location_id,
    is_active: listing.is_active,
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!formData.title.trim() || formData.title.trim().length < 6) {
      setErrorMsg('El título debe tener al menos 6 caracteres.')
      return
    }
    if (!formData.description.trim() || formData.description.trim().length < 30) {
      setErrorMsg('La descripción debe tener al menos 30 caracteres.')
      return
    }
    if (!formData.city.trim()) {
      setErrorMsg('La ciudad es requerida.')
      return
    }

    setErrorMsg('')
    setLoading(true)

    try {
      const result = await updateListing(listing.id, formData)
      if (result.error) {
        setErrorMsg(result.error)
        return
      }
      setSuccessMsg('Anuncio actualizado correctamente.')
      setTimeout(() => router.push(`/listings/${listing.id}`), 1200)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al actualizar.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm'
  const labelClass = 'block mb-1.5 text-sm font-medium text-neutral-700'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Título */}
      <div>
        <label className={labelClass}>
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          minLength={6}
          maxLength={100}
          className={inputClass}
          placeholder="Ej: Habitación amueblada con baño propio"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass}>
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          minLength={30}
          maxLength={2000}
          rows={6}
          className={inputClass}
          placeholder="Describe el espacio, servicios incluidos, reglas de la casa..."
        />
      </div>

      {/* Ciudad y Zona */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Ciudad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
            className={inputClass}
            placeholder="Monterrey"
          />
        </div>
        <div>
          <label className={labelClass}>Zona / Colonia</label>
          <input
            type="text"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            className={inputClass}
            placeholder="San Pedro Garza García"
          />
        </div>
      </div>

      {/* Precio */}
      <div>
        <label className={labelClass}>Precio mensual (MXN)</label>
        <input
          type="number"
          value={formData.price_mxn ?? ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              price_mxn: e.target.value ? parseInt(e.target.value, 10) : null,
            })
          }
          min={500}
          max={80000}
          className={inputClass}
          placeholder="Ej: 5000"
        />
      </div>

      {/* Tipo de anuncio */}
      <div>
        <label className={labelClass}>Tipo de anuncio</label>
        <select
          value={formData.listing_type}
          onChange={(e) =>
            setFormData({ ...formData, listing_type: e.target.value as 'room' | 'roommate' })
          }
          className={inputClass}
        >
          <option value="room">Rento cuarto / espacio</option>
          <option value="roommate">Busco roomie</option>
        </select>
      </div>

      {/* Estado del anuncio */}
      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active ?? true}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="w-4 h-4 accent-brand"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-neutral-700">
          Anuncio activo (visible para todos)
        </label>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-brand text-white py-2.5 rounded-lg font-medium hover:bg-brandHover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
