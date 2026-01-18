'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { saveMyProfile, ProfileData } from './actions'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface OnboardingFormProps {
  initialData: ProfileData | null
}

export default function OnboardingForm({ initialData }: OnboardingFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
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

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('La imagen debe ser menor a 2MB')
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

      let avatarUrl = formData.avatar_url

      // Si hay un archivo nuevo, subirlo a Supabase Storage
      if (avatarFile) {
        const supabase = createBrowserSupabaseClient()

        // Obtener sesión para user_id
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (!session || sessionError) {
          setErrorMsg('No autorizado. Por favor inicia sesión.')
          setLoading(false)
          return
        }

        const userId = session.user.id
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
          return
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = urlData.publicUrl
      }

      const { error } = await saveMyProfile({
        display_name: formData.display_name,
        city: formData.city,
        zone: formData.zone,
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
          placeholder="Ej: Roma Norte, Polanco, etc."
        />
        <p className="mt-1 text-sm text-gray-500">Entre 2 y 80 caracteres</p>
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
        />
        <p className="mt-1 text-sm text-gray-500">
          Solo imágenes, máximo 2MB
        </p>

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
        disabled={loading}
        className="w-full bg-[#FF7A18] text-white px-6 py-3 rounded-lg hover:bg-[#E86F14] disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Guardando...' : 'Guardar perfil'}
      </button>
    </form>
  )
}

