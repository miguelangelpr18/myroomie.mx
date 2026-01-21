import Link from 'next/link'
import { Card, CardHeader, CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import ListingImage from './ListingImage'

interface ListingCardProps {
  listing: {
    id: string
    title: string
    description: string
    city: string
    zone: string
    price_mxn: number | null
    listing_type: 'room' | 'roommate'
    created_at: string
    featured_until: string | null
    image_urls: string[] | null
  }
  href: string
}

export default function ListingCard({ listing, href }: ListingCardProps) {
  const typeLabel = listing.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie'
  const now = new Date()
  const isFeatured = listing.featured_until && new Date(listing.featured_until) > now

  // Normalizar image_urls
  const imageUrls = Array.isArray(listing.image_urls) ? listing.image_urls : []
  const coverImage = imageUrls.length > 0 ? (imageUrls[0] ?? '') : ''
  const coverTrim = typeof coverImage === 'string' ? coverImage.trim() : ''

  return (
    <Link
      href={href}
      className="group rounded-2xl focus:outline-none focus:ring-2 focus:ring-brandBorder focus:ring-offset-2 transition-shadow hover:shadow-md"
    >
      <Card className="cursor-pointer">
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
            <ListingImage
              src={coverTrim || null}
              alt={listing.title ?? 'Listing'}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              wrapperClassName="h-full"
            />
          </div>
          {isFeatured && (
            <div className="absolute left-3 top-3">
              <Badge variant="featured">Destacado</Badge>
            </div>
          )}
          {listing.price_mxn && (
            <div className="absolute left-3 bottom-3 rounded-full border border-neutral-200 bg-white/90 px-3 py-1 text-sm font-semibold text-neutral-900 backdrop-blur">
              ${listing.price_mxn.toLocaleString()} MXN/mes
            </div>
          )}
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="subtle">{typeLabel}</Badge>
            </div>
          </div>
          <h2 className="text-base md:text-lg font-medium mb-1 line-clamp-1">{listing.title}</h2>
          <p className="text-xs text-neutral-500 line-clamp-1">
            {listing.city} · {listing.zone}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-700 line-clamp-2 mb-3">{listing.description}</p>
          <p className="text-xs text-neutral-400">
            {new Date(listing.created_at).toLocaleDateString('es-MX')}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

