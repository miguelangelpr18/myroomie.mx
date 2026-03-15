'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { saveMyProfile, ProfileData } from './actions'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import LocationPickerField from './LocationPickerField'
import ZoneAutocompleteField from './ZoneAutocompleteField'

interface OnboardingFormProps {
  initialData: ProfileData | null
}

export default function OnboardingForm({ initialData }: OnboardingFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar_url || null
  )

  const [formData, setFormData] = useState<ProfileData>({
    display_name: initialData?.display_name || '',
    city: initialData?.city || '',
    zone: initialData?.zone || '',
    location_id: initialData?.location_id ?? null,
    avatar_url: initialData?.avatar_url || null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setAvatarFile(null)
      setAvatarPreview(null)
      return
    }

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Solo se permiten archivos de imagen')
      setAvatarFile(null)
      setAvatarPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen debe ser menor a 5MB')
      setAvatarFile(null)
      setAvatarPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setAvatarFile(file)
    setErrorMsg('')

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

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

      if (!formData.location_id || !String(formData.location_id).trim()) {
        setErrorMsg('Selecciona una ubicación de la lista')
        setLoading(false)
        return
      }

      let avatarUrl = formData.avatar_url

      // Si hay un archivo nuevo, subirlo a Supabase Storage
      if (avatarFile) {
        setUploading(true)
        const supabase = createBrowserSupabaseClient()

        // Obtener sesión para user_id
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (!user || authError) {
          setErrorMsg('No autorizado. Por favor inicia sesión.')
          setLoading(false)
          setUploading(false)
          return
        }

        const userId = user.id
        const filePath = `${userId}/avatar.jpg`

        // Subir archivo
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            upsert: true,
            contentType: avatarFile.type,
          })

        if (uploadError) {
          setErrorMsg(`Error al subir imagen: ${uploadError.message}`)
          setLoading(false)
          setUploading(false)
          return
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = urlData.publicUrl
        setUploading(false)
      }

      const { error } = await saveMyProfile({
        display_name: formData.display_name,
        city: formData.city,
        zone: formData.zone,
        location_id: formData.location_id ?? undefined,
        avatar_url: avatarUrl,
      })

      if (error) {
        setErrorMsg(error)
        setLoading(false)
        return
      }

      // Si no hay error, saveMyProfile hace redirect a /explore automáticamente
      // No necesitamos hacer nada más aquí
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar perfil')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="display_name" className="block mb-2 font-medium">
          Nombre de perfil <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="display_name"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          required
          minLength={2}
          maxLength={40}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
          placeholder="Tu nombre público"
        />
        <p className="mt-1 text-sm text-gray-500">Entre 2 y 40 caracteres</p>
      </div>

      <LocationPickerField
        onSelect={(payload) => {
          setFormData((prev) => ({
            ...prev,
            location_id: payload.location_id,
            city: payload.city,
            zone: '', // Limpiar zona al cambiar ciudad
          }))
          setErrorMsg('')
        }}
        onClear={() => {
          setFormData((prev) => ({
            ...prev,
            location_id: null,
            city: '',
            zone: '',
          }))
        }}
        error={errorMsg === 'Selecciona una ubicación de la lista' ? errorMsg : undefined}
      />

      <div className="mt-4">
        <ZoneAutocompleteField
          locationId={formData.location_id ?? null}
          value={formData.zone}
          onChange={(zone) => setFormData({ ...formData, zone })}
          error={undefined}
        />
      </div>

      <div>
        <label htmlFor="avatar" className="block mb-2 font-medium">
          Avatar (opcional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="avatar"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p className="mt-1 text-sm text-gray-500">
          Solo imágenes, máximo 5MB
        </p>
        {uploading && (
          <div className="mt-2 flex items-center gap-2 text-sm text-brand">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Estamos optimizando tu imagen...</span>
          </div>
        )}

        {avatarPreview && (
          <div className="mt-4">
            <img
              src={avatarPreview}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
            />
          </div>
        )}
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
        disabled={loading || uploading}
        className="w-full bg-brand text-white px-6 py-3 rounded-lg hover:bg-brandHover disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? 'Subiendo imagen...' : loading ? 'Guardando...' : 'Guardar perfil'}
      </button>
    </form>
  )
}

