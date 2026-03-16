// Shared domain types for MyRoomie.mx
// These mirror the Supabase database schema and are used across
// server components, client components, and server actions.

// ─── Location ────────────────────────────────────────────────

export interface Location {
  id: string
  provider: string
  place_id: string
  label: string
  city: string | null
  region: string | null
  country: string | null
  lat: number | null
  lng: number | null
  created_at: string
}

// ─── Profile ─────────────────────────────────────────────────

export interface Profile {
  user_id: string
  display_name: string
  city: string
  zone: string
  avatar_url: string | null
  bio: string | null
  age: number | null
  pets: boolean | null
  smoker: boolean | null
  cleanliness: number | null
  parties: boolean | null
  schedule: 'day' | 'night' | null
  budget_min: number | null
  budget_max: number | null
  location_id: string | null
  featured_until: string | null
  created_at: string
  updated_at: string
}

// Subset used in cards / lists
export type ProfileCard = Pick<
  Profile,
  | 'user_id'
  | 'display_name'
  | 'city'
  | 'zone'
  | 'avatar_url'
  | 'pets'
  | 'smoker'
  | 'cleanliness'
  | 'parties'
  | 'schedule'
  | 'featured_until'
>

// ─── Listing ─────────────────────────────────────────────────

export type ListingType = 'room' | 'roommate'
export type ListingSubtype = 'solo_renta' | 'buscar_roomie'

export interface ListingLifestylePrefs {
  occupation?: string
  desired_vibe?: string
  smoking?: boolean
  pets?: boolean
  visitors?: 'rare' | 'occasional' | 'frequent'
  cleanliness?: number
  noise_tolerance?: number
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  city: string
  zone: string
  price_mxn: number | null
  listing_type: ListingType
  listing_subtype: ListingSubtype | null
  image_urls: string[]
  amenities: string[]
  lifestyle_prefs: ListingLifestylePrefs | null
  location_id: string | null
  is_active: boolean
  featured_until: string | null
  created_at: string
  updated_at: string
}

// Subset used in listing cards
export type ListingCard = Pick<
  Listing,
  | 'id'
  | 'title'
  | 'city'
  | 'zone'
  | 'price_mxn'
  | 'listing_type'
  | 'image_urls'
  | 'featured_until'
  | 'created_at'
>

// ─── Messaging ───────────────────────────────────────────────

export interface Thread {
  id: string
  user1_id: string
  user2_id: string
  listing_id: string | null
  created_at: string
}

export interface Message {
  id: string
  thread_id: string
  sender_id: string
  body: string
  created_at: string
}

export interface ThreadParticipant {
  thread_id: string
  profile_id: string
  last_read_at: string | null
  created_at: string
}

// ─── Listing Saves ───────────────────────────────────────────

export interface ListingSave {
  id: string
  user_id: string
  listing_id: string
  created_at: string
}
