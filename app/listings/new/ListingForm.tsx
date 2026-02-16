'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createListing, ListingData, attachListingImages } from './actions'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import ImageUploader from '@/app/components/listings/ImageUploader'
import LocationPickerField from './LocationPickerField'
import ZoneAutocompleteField from './ZoneAutocompleteField'

export default function ListingForm() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string
    description?: string
    photos?: string
    location?: string
  }>({})
  const router = useRouter()

  const [formData, setFormData] = useState<ListingData>({
    title: '',
    description: '',
    city: '',
    zone: '',
    location_id: null,
    price_mxn: null,
    listing_type: 'room',
  })

  // Validar campos en tiempo real
  const validateField = (field: string, value: string) => {
    setFieldErrors((prev) => {
      const updated = { ...prev }
      
      if (field === 'title') {
        if (!value.trim()) {
          updated.title = 'El título es requerido'
        } else if (value.trim().length < 6) {
          updated.title = 'El título debe tener al menos 6 caracteres'
        } else {
          delete updated.title
        }
      }
      
      if (field === 'description') {
        if (!value.trim()) {
          updated.description = 'La descripción es requerida'
        } else if (value.trim().length < 30) {
          updated.description = 'La descripción debe tener al menos 30 caracteres'
        } else {
          delete updated.description
        }
      }
      
      return updated
    })
  }

  // Validar fotos
  const validatePhotos = () => {
    const errors: typeof fieldErrors = {}
    if (files.length > 0 && files.length < 2) {
      errors.photos = 'Agrega al menos 2 fotos para que tu anuncio se vea atractivo'
    }
    setFieldErrors((prev) => ({ ...prev, ...errors }))
  }

  // Verificar si hay errores
  const hasErrors = () => {
    const titleValid = formData.title.trim().length >= 6
    const descriptionValid = formData.description.trim().length >= 30
    const locationValid = !!(formData.location_id && String(formData.location_id).trim())
    const zoneValid = formData.zone.trim().length >= 2
    const photosValid = files.length === 0 || files.length >= 2
    
    return !titleValid || !descriptionValid || !locationValid || !zoneValid || !photosValid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      // Validaciones client-side
      setFieldErrors({})
      
      if (!formData.title.trim() || formData.title.trim().length < 6) {
        setFieldErrors((prev) => ({ ...prev, title: 'El título debe tener al menos 6 caracteres' }))
        setLoading(false)
        return
      }

      if (!formData.description.trim() || formData.description.trim().length < 30) {
        setFieldErrors((prev) => ({ ...prev, description: 'La descripción debe tener al menos 30 caracteres' }))
        setLoading(false)
        return
      }

      if (!formData.location_id || !String(formData.location_id).trim()) {
        setFieldErrors((prev) => ({ ...prev, location: 'Selecciona una ubicación de la lista' }))
        setLoading(false)
        return
      }

      if (!formData.zone || formData.zone.trim().length < 2) {
        setErrorMsg('La zona / colonia es obligatoria')
        setLoading(false)
        return
      }

      // Validar fotos: si se suben, mínimo 2
      if (files.length > 0 && files.length < 2) {
        setFieldErrors((prev) => ({ ...prev, photos: 'Agrega al menos 2 fotos para que tu anuncio se vea atractivo' }))
        setLoading(false)
        return
      }

      // Convertir price_mxn a número si viene string
      const priceValue = formData.price_mxn
        ? (typeof formData.price_mxn === 'string' ? parseInt(formData.price_mxn, 10) : formData.price_mxn)
        : null

      // Paso 1: Crear listing
      const { error, listingId, locationId } = await createListing({
        ...formData,
        price_mxn: priceValue,
      })

      if (error || !listingId) {
        setErrorMsg(error || 'Error al crear el anuncio')
        setLoading(false)
        return
      }

      // Paso 2: Subir imágenes si hay
      if (files.length > 0) {
        setUploading(true)
        const supabase = createBrowserSupabaseClient()
        
        // Obtener userId desde la sesión
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setErrorMsg('Sesión expirada. Por favor inicia sesión de nuevo.')
          setLoading(false)
          setUploading(false)
          return
        }

        const userId = session.user.id
        const imageUrls: string[] = []

        try {
          // Subir cada imagen
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            // Sanitizar nombre: reemplazar espacios y caracteres especiales
            const sanitizedName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '-')
            const fileExtension = sanitizedName.split('.').pop() || 'jpg'
            const fileName = `${crypto.randomUUID()}-${sanitizedName}`
            const path = `listings/${userId}/${listingId}/${fileName}`

            const { error: uploadError } = await supabase.storage
              .from('listing-images')
              .upload(path, file, {
                upsert: false,
                contentType: file.type,
              })

            if (uploadError) {
              console.error('Error uploading image:', uploadError)
              setErrorMsg('No pudimos subir una de tus fotos. Intenta de nuevo.')
              setLoading(false)
              setUploading(false)
              return
            }

            // Obtener URL pública
            const { data: urlData } = supabase.storage
              .from('listing-images')
              .getPublicUrl(path)

            if (urlData?.publicUrl) {
              imageUrls.push(urlData.publicUrl)
            }
          }

          // Paso 3: Actualizar listing con URLs
          if (imageUrls.length > 0) {
            const { error: attachError } = await attachListingImages(listingId, imageUrls)
            if (attachError) {
              console.error('Error attaching images:', attachError)
              // No fallar completamente, el listing ya está creado
              // Solo mostrar warning
              setErrorMsg('Anuncio creado, pero hubo un problema al guardar las fotos. Puedes editarlas después.')
            }
          }
        } catch (err) {
          console.error('Error in upload process:', err)
          setErrorMsg('Error al subir las fotos. El anuncio fue creado, puedes agregar fotos después.')
        } finally {
          setUploading(false)
        }
      }

      // Paso 4: Redirigir a listado (con location_id si existe)
      router.push(locationId ? `/listings?location_id=${locationId}` : '/listings')
      router.refresh()
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
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
          onChange={(e) => {
            setFormData({ ...formData, title: e.target.value })
            validateField('title', e.target.value)
          }}
          onBlur={(e) => validateField('title', e.target.value)}
          required
          minLength={6}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 ${
            fieldErrors.title ? 'border-red-300' : ''
          }`}
          placeholder="Ej: Cuarto amueblado cerca de UANL"
        />
        {fieldErrors.title ? (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
        ) : (
          <p className="mt-1 text-xs text-neutral-500">Un buen título genera hasta 3× más mensajes</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block mb-2 font-medium">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value })
            validateField('description', e.target.value)
          }}
          onBlur={(e) => validateField('description', e.target.value)}
          required
          minLength={30}
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 ${
            fieldErrors.description ? 'border-red-300' : ''
          }`}
          placeholder="Describe el cuarto, la zona, qué incluye y el tipo de roomie que buscas…"
        />
        {fieldErrors.description ? (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
        ) : (
          <p className="mt-1 text-xs text-neutral-500">Entre más detalles, más confianza generas</p>
        )}
      </div>

      <LocationPickerField
        onSelect={(payload) => {
          setFormData((prev) => ({
            ...prev,
            location_id: payload.location_id,
            city: payload.city,
            zone: payload.zone,
          }))
          setFieldErrors((prev) => {
            const next = { ...prev }
            delete next.location
            return next
          })
        }}
        onClear={() => {
          setFormData((prev) => ({
            ...prev,
            location_id: null,
            city: '',
            zone: '',
          }))
        }}
        error={fieldErrors.location}
      />

      <div className="mt-4">
        <ZoneAutocompleteField
          locationId={formData.location_id ?? null}
          value={formData.zone}
          onChange={(next) => setFormData((prev) => ({ ...prev, zone: next }))}
          error={errorMsg === 'La zona / colonia es obligatoria' ? errorMsg : undefined}
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
          placeholder="Ej: 5000"
        />
        <p className="mt-1 text-sm text-gray-500">Solo números enteros, mayor o igual a 0</p>
      </div>

      <div>
        <ImageUploader 
          files={files} 
          setFiles={setFiles} 
          maxFiles={6}
          onFilesChange={(newFiles) => {
            setFiles(newFiles)
            // Validar fotos cuando cambian
            if (newFiles.length > 0 && newFiles.length < 2) {
              setFieldErrors((prev) => ({ ...prev, photos: 'Agrega al menos 2 fotos para que tu anuncio se vea atractivo' }))
            } else {
              setFieldErrors((prev) => {
                const updated = { ...prev }
                delete updated.photos
                return updated
              })
            }
          }}
        />
        {fieldErrors.photos && (
          <p className="mt-2 text-sm text-red-600">{fieldErrors.photos}</p>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || uploading || hasErrors()}
        className="w-full bg-brand text-white px-6 py-3 rounded-lg hover:bg-brandHover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Subiendo fotos...' : loading ? 'Publicando...' : 'Publicar anuncio'}
      </button>
    </form>
  )
}

