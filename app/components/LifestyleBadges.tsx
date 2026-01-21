interface LifestyleProfile {
  pets?: boolean | null
  smoker?: boolean | null
  cleanliness?: number | string | null
  parties?: boolean | null
  schedule?: string | null
}

interface LifestyleBadgesProps {
  profile: LifestyleProfile
}

export default function LifestyleBadges({ profile }: LifestyleBadgesProps) {
  const badges: string[] = []

  // pets
  if (profile.pets !== null && profile.pets !== undefined) {
    badges.push(profile.pets ? 'Con mascotas' : 'Sin mascotas')
  }

  // smoker
  if (profile.smoker !== null && profile.smoker !== undefined) {
    badges.push(profile.smoker ? 'Fuma' : 'No fuma')
  }

  // cleanliness: normalizar string -> number
  if (profile.cleanliness !== null && profile.cleanliness !== undefined) {
    let cleanlinessValue: number | null = null
    
    if (typeof profile.cleanliness === 'string') {
      const parsed = Number(profile.cleanliness)
      cleanlinessValue = !isNaN(parsed) ? parsed : null
    } else if (typeof profile.cleanliness === 'number') {
      cleanlinessValue = profile.cleanliness
    }

    if (cleanlinessValue !== null) {
      if (cleanlinessValue === 1) {
        badges.push('Limpieza: Relax')
      } else if (cleanlinessValue === 2) {
        badges.push('Limpieza: Normal')
      } else if (cleanlinessValue === 3) {
        badges.push('Limpieza: Muy limpio')
      }
    }
  }

  // parties
  if (profile.parties !== null && profile.parties !== undefined) {
    badges.push(profile.parties ? 'Fiestero' : 'Tranquilo')
  }

  // schedule
  if (profile.schedule) {
    badges.push(profile.schedule === 'day' ? 'Día' : 'Noche')
  }

  if (badges.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {badges.map((badge, index) => (
        <span
          key={index}
          className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
        >
          {badge}
        </span>
      ))}
    </div>
  )
}


