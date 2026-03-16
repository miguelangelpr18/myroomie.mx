'use client'

import SharedPromoteButton from '@/app/components/ui/PromoteButton'
import { activateListingPromotion } from '../actions'

interface ListingPromoteButtonProps {
  listingId: string
  planDays: number
}

export default function PromoteButton({ listingId, planDays }: ListingPromoteButtonProps) {
  return (
    <SharedPromoteButton
      onActivate={() => activateListingPromotion(listingId, planDays)}
    />
  )
}
