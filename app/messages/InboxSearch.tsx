'use client'

import { useState } from 'react'

export default function InboxSearch() {
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="flex-1 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm focus-within:ring-2 focus-within:ring-[#FF7A18]/20">
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Buscar"
        className="w-full bg-transparent outline-none placeholder:text-neutral-400"
      />
    </div>
  )
}





