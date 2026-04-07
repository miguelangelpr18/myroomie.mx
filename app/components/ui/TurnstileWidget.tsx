'use client'

import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
}

/**
 * Cloudflare Turnstile CAPTCHA widget.
 * Only renders when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
 * In dev without the key, it silently skips (no CAPTCHA required).
 */
export default function TurnstileWidget({ onSuccess, onError }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey) return null

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onSuccess}
      onError={onError}
      options={{
        theme: 'light',
        size: 'flexible',
      }}
    />
  )
}
