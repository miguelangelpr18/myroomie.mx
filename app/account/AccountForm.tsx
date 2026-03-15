'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, AccountProfileData } from './actions'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface AccountFormProps {
  initialData: {
    display_name: string
    avatar_url: string | null
    email: string
  }
}

export default function AccountForm({ initialData }: AccountFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData.avatar_url || null
  )

  const [formData, setFormData] = useState({
    display_name: initialData.display_name || '',
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
    setLoading(true)

    try {
      // Validaciones client-side básicas
      if (!formData.display_name.trim()) {
        setErrorMsg('Display name es requerido')
        setLoading(false)
        return
      }

      let avatarUrl = initialData.avatar_url

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

      const { error } = await updateProfile({
        display_name: formData.display_name,
        avatar_url: avatarUrl,
      })

      if (error) {
        setErrorMsg(error)
        setLoading(false)
        return
      }

      // Refrescar para actualizar header y UI
      router.refresh()
      setLoading(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al actualizar perfil')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email (read-only) */}
      <div>
        <label htmlFor="email" className="block mb-2 font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={initialData.email}
          disabled
          className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
      </div>

      {/* Display name */}
      <div>
        <label htmlFor="display_name" className="block mb-2 font-medium">
          Nombre de perfil
        </label>
        <input
          type="text"
          id="display_name"
          name="display_name"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          required
          minLength={2}
          maxLength={40}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
          placeholder="Tu nombre de perfil"
        />
      </div>

      {/* Avatar */}
      <div>
        <label className="block mb-2 font-medium">Avatar</label>
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand text-white flex items-center justify-center text-2xl font-semibold">
              {formData.display_name.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 5MB. Formatos: JPG, PNG</p>
            {uploading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-brand">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Estamos optimizando tu imagen...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-brand text-white px-6 py-3 rounded-lg hover:bg-brandHover disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? 'Subiendo imagen...' : loading ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}
    </form>
  )
}



