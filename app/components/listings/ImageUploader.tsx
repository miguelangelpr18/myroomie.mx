'use client'

import { useState, useRef, useEffect } from 'react'

interface ImageUploaderProps {
  files: File[]
  setFiles: (files: File[]) => void
  maxFiles?: number
  onFilesChange?: (files: File[]) => void
}

export default function ImageUploader({ files, setFiles, maxFiles = 6, onFilesChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [objectUrls, setObjectUrls] = useState<string[]>([])

  // Limpiar object URLs cuando se desmonte o cambien los files
  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [objectUrls])

  // Generar object URLs cuando cambien los files
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setObjectUrls(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (selectedFiles.length === 0) return

    // Validar tipo de archivo
    const validFiles = selectedFiles.filter((file) => file.type.startsWith('image/'))
    if (validFiles.length !== selectedFiles.length) {
      alert('Solo se permiten archivos de imagen (JPG, PNG, WebP)')
    }

    // Validar tamaño (5MB)
    const sizeValidFiles = validFiles.filter((file) => file.size <= 5 * 1024 * 1024)
    if (sizeValidFiles.length !== validFiles.length) {
      alert('Algunas imágenes exceden el tamaño máximo de 5MB')
    }

    // Validar cantidad máxima
    const currentCount = files.length
    const remainingSlots = maxFiles - currentCount
    const filesToAdd = sizeValidFiles.slice(0, remainingSlots)
    
    if (sizeValidFiles.length > remainingSlots) {
      alert(`Solo puedes subir hasta ${maxFiles} fotos. Se agregaron ${filesToAdd.length} de ${sizeValidFiles.length} seleccionadas.`)
    }

    const updatedFiles = [...files, ...filesToAdd]
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange?.(newFiles)
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-neutral-900 mb-1">
            Fotos
          </label>
          <p className="text-xs text-neutral-500">
            Hasta {maxFiles} fotos (JPG/PNG/WebP). Máx 5MB c/u.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= maxFiles}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Subir fotos
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id="image-upload"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={files.length >= maxFiles}
      />

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {files.map((file, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200">
              <img
                src={objectUrls[index]}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold hover:bg-red-600 transition-colors"
                aria-label="Remover imagen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

