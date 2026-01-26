'use client'

import { useRef, useEffect } from 'react'

export default function AutoScrollToBottom({ dep }: { dep: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [dep])

  return <div ref={ref} />
}


