'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { updateProfile } from './actions'

interface Profile {
  user_id: string
  display_name: string
  city: string
  zone: string
  bio?: string | null
  avatar_url?: string | null
  location_id?: string | null
}

interface EditProfileFormProps {
  profile: Profile
}

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null)

  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    city: profile.city || '',
    zone: profile.zone || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || null,
    location_id: profile.location_id || null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Solo se permiten imágenes.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen no puede superar 5MB.')
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
    setErrorMsg('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return

    setErrorMsg('')
    setLoading(true)

    try {
      let avatarUrl = formData.avatar_url

      if (avatarFile) {
        setUploading(true)
        const supabase = createBrowserSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setErrorMsg('No autorizado.')
          setLoading(false)
          return
        }

        const ext = avatarFile.name.split('.').pop()
        const fileName = `${user.id}/avatar-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) {
          setErrorMsg(`Error al subir imagen: ${uploadError.message}`)
          setLoading(false)
          setUploading(false)
          return
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
        avatarUrl = urlData.publicUrl
        setUploading(false)
      }

      const result = await updateProfile({ ...formData, avatar_url: avatarUrl })
      if (result.error) {
        setErrorMsg(result.error)
        return
      }

      setSuccessMsg('Perfil actualizado correctamente.')
      setTimeout(() => router.push(`/profiles/${profile.user_id}`), 1200)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al actualizar.')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm'
  const labelClass = 'block mb-1.5 text-sm font-medium text-neutral-700'
  const initial = formData.display_name.charAt(0).toUpperCase() || '?'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar */}
      <div>
        <label className={labelClass}>Foto de perfil</label>
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Vista previa"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-neutral-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand text-white flex items-center justify-center text-2xl font-semibold">
              {initial}
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cambiar foto
            </button>
            <p className="text-xs text-neutral-500 mt-1">Imágenes hasta 5MB</p>
            {uploading && (
              <p className="text-xs text-brand mt-1 flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Subiendo imagen...
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className={labelClass}>
          Nombre de perfil <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          required
          minLength={2}
          maxLength={40}
          className={inputClass}
        />
      </div>

      {/* Bio */}
      <div>
        <label className={labelClass}>Bio / Sobre mí</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          maxLength={400}
          placeholder="Cuéntanos un poco de ti..."
          className={inputClass}
        />
        <p className="mt-1 text-xs text-neutral-400">{formData.bio.length}/400</p>
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
          />
        </div>
        <div>
          <label className={labelClass}>Zona / Colonia</label>
          <input
            type="text"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            className={inputClass}
          />
        </div>
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
          disabled={loading || uploading}
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
