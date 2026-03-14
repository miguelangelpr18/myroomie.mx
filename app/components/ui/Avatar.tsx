import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  initial?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-3xl',
}

export default function Avatar({ src, alt, size = 'md', initial = '?' }: AvatarProps) {
  if (src && src.trim() !== '') {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden relative flex-shrink-0`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 96px, 128px"
        />
      </div>
    )
  }

  // Fallback to initial
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-brand text-white flex items-center justify-center font-semibold flex-shrink-0`}>
      {initial}
    </div>
  )
}
