'use client'

interface ListingsFiltersProps {
  listing_type: string
  min: string
  max: string
  onListingTypeChange: (value: string) => void
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
}

export function ListingsFilters({
  listing_type,
  min,
  max,
  onListingTypeChange,
  onMinChange,
  onMaxChange,
}: ListingsFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <select
        value={listing_type || 'all'}
        onChange={(e) => onListingTypeChange(e.target.value)}
        className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
      >
        <option value="all">Todos</option>
        <option value="room">Rento cuarto</option>
        <option value="roommate">Busco roomie</option>
      </select>
      <input
        type="number"
        value={min || ''}
        onChange={(e) => onMinChange(e.target.value)}
        placeholder="Precio min"
        min="0"
        className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
      />
      <input
        type="number"
        value={max || ''}
        onChange={(e) => onMaxChange(e.target.value)}
        placeholder="Precio max"
        min="0"
        className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
      />
    </div>
  )
}

interface RoomiesFiltersProps {
  budget_min: string
  budget_max: string
  onBudgetMinChange: (value: string) => void
  onBudgetMaxChange: (value: string) => void
}

export function RoomiesFilters({
  budget_min,
  budget_max,
  onBudgetMinChange,
  onBudgetMaxChange,
}: RoomiesFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input
        type="number"
        value={budget_min || ''}
        onChange={(e) => onBudgetMinChange(e.target.value)}
        placeholder="Presupuesto min"
        min="0"
        className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
      />
      <input
        type="number"
        value={budget_max || ''}
        onChange={(e) => onBudgetMaxChange(e.target.value)}
        placeholder="Presupuesto max"
        min="0"
        className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
      />
    </div>
  )
}
