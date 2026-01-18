'use client'

import { useState } from 'react'
import { testSupabaseConnection } from './actions'

export default function SupabaseDebugClient() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    setResult('')

    try {
      const data = await testSupabaseConnection()
      
      if (data.error) {
        setResult(`ERROR: ${data.error}`)
      } else {
        setResult(
          `OK: ${data.message}\n` +
          `URL: ${data.urlPreview}\n` +
          `Key: ${data.hasKey ? 'CONFIGURADO' : 'NO CONFIGURADO'}`
        )
      }
    } catch (err) {
      setResult(
        `ERROR: ${err instanceof Error ? err.message : 'Error desconocido'}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug</h1>
      
      <div className="mb-4">
        <button
          onClick={handleTest}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Probando...' : 'Probar conexión'}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <pre className="whitespace-pre-wrap font-mono text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}
