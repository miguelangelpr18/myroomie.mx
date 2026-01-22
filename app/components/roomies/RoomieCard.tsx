import Link from 'next/link'
import { Card, CardHeader, CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import ListingImage from '../listings/ListingImage'
import LifestyleBadges from '../LifestyleBadges'

interface RoomieCardProps {
  profile: {
    user_id: string
    display_name: string
    city: string
    zone: string
    avatar_url: string | null
    featured_until: string | null
    pets?: boolean | null
    smoker?: boolean | null
    cleanliness?: string | null
    parties?: boolean | null
    schedule?: string | null
  }
  href: string
}

export default function RoomieCard({ profile, href }: RoomieCardProps) {
  const now = new Date()
  const isFeatured = profile.featured_until && new Date(profile.featured_until) > now
  const initial = profile.display_name?.charAt(0).toUpperCase() || '?'

  // Normalizar avatar_url
  const avatarUrl = profile.avatar_url?.trim() || null

  // Convertir profile a formato LifestyleBadges (cleanliness: string -> number)
  const lifestyleProfile = {
    pets: profile.pets,
    smoker: profile.smoker,
    cleanliness: profile.cleanliness
      ? typeof profile.cleanliness === 'string'
        ? Number(profile.cleanliness) || null
        : typeof profile.cleanliness === 'number'
        ? profile.cleanliness
        : null
      : null,
    parties: profile.parties,
    schedule: profile.schedule,
  }

  return (
    <Link
      href={href}
      className="group rounded-2xl h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-brandBorder focus:ring-offset-2 transition-shadow hover:shadow-md"
    >
      <Card className="cursor-pointer h-full flex flex-col">
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
            {avatarUrl ? (
              <ListingImage
                src={avatarUrl}
                alt={profile.display_name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                wrapperClassName="h-full"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-500">
                <div className="w-20 h-20 rounded-full bg-brandSoft text-brandText border border-brandBorder flex items-center justify-center text-3xl font-semibold">
                  {initial}
                </div>
                <div className="text-xs font-medium">Sin foto</div>
              </div>
            )}
          </div>
          {isFeatured && (
            <div className="absolute left-3 top-3">
              <Badge variant="featured">Destacado</Badge>
            </div>
          )}
        </div>
        <CardHeader className="flex-1 flex flex-col">
          <h2 className="text-base md:text-lg font-semibold mb-1 line-clamp-1">{profile.display_name}</h2>
          <p className="text-xs text-neutral-500 line-clamp-1">
            {profile.city} · {profile.zone}
          </p>
        </CardHeader>
        <CardContent className="mt-auto">
          <LifestyleBadges profile={lifestyleProfile} />
        </CardContent>
      </Card>
    </Link>
  )
}

