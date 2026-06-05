'use client'
import Image from 'next/image'
import { useState } from 'react'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  photoUrl: string | null
  size: number
  className?: string
}

export function Avatar({ name, photoUrl, size, className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  if (photoUrl && !imgError) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={photoUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={`rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
