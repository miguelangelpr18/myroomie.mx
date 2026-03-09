'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteListing, toggleListingActive } from './actions'

interface OwnerActionsProps {
  listingId: string
  isActive: boolean
}

export default function OwnerActions({ listingId, isActive }: OwnerActionsProps) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [active, setActive] = useState(isActive)

  const handleDelete = async () => {
    setDeleting(true)
    setErrorMsg('')
    try {
      const result = await deleteListing(listingId)
      if (result.error) {
        setErrorMsg(result.error)
        setDeleting(false)
        return
      }
      router.push('/dashboard')
    } catch {
      setErrorMsg('Error al eliminar el anuncio.')
      setDeleting(false)
    }
  }

  const handleToggleActive = async () => {
    setToggling(true)
    setErrorMsg('')
    try {
      const result = await toggleListingActive(listingId, !active)
      if (result.error) {
        setErrorMsg(result.error)
        setToggling(false)
        return
      }
      setActive(!active)
    } catch {
      setErrorMsg('Error al cambiar el estado.')
    } finally {
      setToggling(false)
    }
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
          Gestionar anuncio
        </p>
        <Link
          href={`/listings/${listingId}/edit`}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar anuncio
        </Link>
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={toggling}
          className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60 ${
            active
              ? 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              : 'border-brand/30 bg-brand/5 text-brand hover:bg-brand/10'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={active
                ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"}
            />
          </svg>
          {toggling ? 'Cambiando...' : active ? 'Marcar como rentado' : 'Reactivar anuncio'}
        </button>
        <Link
          href={`/promote/listing/${listingId}`}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brandHover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Promocionar anuncio
        </Link>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar anuncio
        </button>

        {errorMsg && (
          <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
        )}
      </div>

      {/* Modal confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">¿Eliminar este anuncio?</h3>
            <p className="text-sm text-neutral-500 text-center mb-6">
              Esta acción es permanente y no se puede deshacer. El anuncio y sus mensajes asociados se eliminarán.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
