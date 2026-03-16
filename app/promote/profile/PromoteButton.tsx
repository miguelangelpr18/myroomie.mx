'use client'

import SharedPromoteButton from '@/app/components/ui/PromoteButton'
import { activateProfilePromotion } from './actions'

interface ProfilePromoteButtonProps {
  planDays: number
}

export default function PromoteButton({ planDays }: ProfilePromoteButtonProps) {
  return (
    <SharedPromoteButton
      onActivate={() => activateProfilePromotion(planDays)}
    />
  )
}
