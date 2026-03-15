'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface ReportButtonProps {
  reportedType: 'listing' | 'profile' | 'message'
  reportedId: string
}

const REASONS = [
  'Contenido falso o engañoso',
  'Spam o publicidad no solicitada',
  'Contenido ofensivo o inapropiado',
  'Información de contacto fraudulenta',
  'Precio irreal o estafa',
  'Otro',
]

export default function ReportButton({ reportedType, reportedId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    if (!reason) {
      setErrorMsg('Selecciona un motivo.')
      return
    }
    setSubmitting(true)
    setErrorMsg('')
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setErrorMsg('Debes iniciar sesión para reportar.')
        setSubmitting(false)
        return
      }
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_type: reportedType,
        reported_id: reportedId,
        reason,
        details: details.trim() || null,
      })
      if (error) {
        setErrorMsg('Error al enviar el reporte. Intenta de nuevo.')
        setSubmitting(false)
        return
      }
      setSent(true)
    } catch {
      setErrorMsg('Error inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        Reportar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">Reporte enviado</h3>
                <p className="text-sm text-neutral-500 mb-4">Gracias por ayudar a mantener la comunidad segura.</p>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setSent(false); setReason(''); setDetails('') }}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Reportar contenido</h3>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                    aria-label="Cerrar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-neutral-500 mb-4">¿Por qué quieres reportar este contenido?</p>
                <div className="space-y-2 mb-4">
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        reason === r ? 'border-brand bg-brand/5' : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="accent-brand"
                      />
                      <span className="text-sm text-neutral-700">{r}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Detalles adicionales (opcional)"
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 mb-3"
                />
                {errorMsg && (
                  <p className="text-xs text-red-600 mb-3">{errorMsg}</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !reason}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Enviando...' : 'Enviar reporte'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
