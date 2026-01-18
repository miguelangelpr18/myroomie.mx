'use client'

import { useState, FormEvent } from 'react'
import { createListing, ListingData } from './actions'

export default function ListingForm() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState<ListingData>({
    title: '',
    description: '',
    city: '',
    zone: '',
    price_mxn: null,
    listing_type: 'room',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      // Validaciones client-side básicas
      if (!formData.title.trim() || formData.title.trim().length < 5) {
        setErrorMsg('El título debe tener al menos 5 caracteres')
        setLoading(false)
        return
      }

      if (!formData.description.trim() || formData.description.trim().length < 20) {
        setErrorMsg('La descripción debe tener al menos 20 caracteres')
        setLoading(false)
        return
      }

      if (!formData.city.trim()) {
        setErrorMsg('La ciudad es requerida')
        setLoading(false)
        return
      }

      if (!formData.zone.trim()) {
        setErrorMsg('La zona es requerida')
        setLoading(false)
        return
      }

      // Convertir price_mxn a número si viene string
      const priceValue = formData.price_mxn
        ? (typeof formData.price_mxn === 'string' ? parseInt(formData.price_mxn, 10) : formData.price_mxn)
        : null

      const { error } = await createListing({
        ...formData,
        price_mxn: priceValue,
      })

      if (error) {
        setErrorMsg(error)
        setLoading(false)
        return
      }

      // Si no hay error, createListing hace redirect a /listings automáticamente
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al crear listing')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="listing_type" className="block mb-2 font-medium">
          Tipo de listing <span className="text-red-500">*</span>
        </label>
        <select
          id="listing_type"
          value={formData.listing_type}
          onChange={(e) => setFormData({ ...formData, listing_type: e.target.value as 'room' | 'roommate' })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
        >
          <option value="room">Rento cuarto</option>
          <option value="roommate">Busco roomie</option>
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block mb-2 font-medium">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          minLength={5}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
          placeholder="Ej: Cuarto disponible en Roma Norte"
        />
        <p className="mt-1 text-sm text-gray-500">Mínimo 5 caracteres</p>
      </div>

      <div>
        <label htmlFor="description" className="block mb-2 font-medium">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          minLength={20}
          rows={6}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
          placeholder="Describe el espacio, las condiciones, etc."
        />
        <p className="mt-1 text-sm text-gray-500">Mínimo 20 caracteres</p>
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
          placeholder="Ej: Ciudad de México"
        />
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
          placeholder="Ej: Roma Norte, Polanco, etc."
        />
      </div>

      <div>
        <label htmlFor="price_mxn" className="block mb-2 font-medium">
          Precio mensual MXN (opcional)
        </label>
        <input
          type="number"
          id="price_mxn"
          value={formData.price_mxn || ''}
          onChange={(e) => setFormData({ ...formData, price_mxn: e.target.value ? parseInt(e.target.value, 10) : null })}
          min="0"
          step="1"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
          placeholder="Ej: 5000"
        />
        <p className="mt-1 text-sm text-gray-500">Solo números enteros, mayor o igual a 0</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#FF7A18] text-white px-6 py-3 rounded-lg hover:bg-[#E86F14] disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Publicando...' : 'Publicar anuncio'}
      </button>
    </form>
  )
}

