'use client'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

interface CategoryCardProps {
  id: string
  name: string
  handle: string
  icon?: string
  image?: string
}

// Color palette for category cards
const PALETTE = [
  { bg: '#FFF3E0', text: '#E65100' },
  { bg: '#E3F2FD', text: '#1565C0' },
  { bg: '#FCE4EC', text: '#880E4F' },
  { bg: '#E8F5E9', text: '#1B5E20' },
  { bg: '#EDE7F6', text: '#4527A0' },
  { bg: '#FFF8E1', text: '#F57F17' },
  { bg: '#F3E5F5', text: '#6A1B9A' },
  { bg: '#E0F7FA', text: '#006064' },
  { bg: '#EFEBE9', text: '#3E2723' },
  { bg: '#F5F5F5', text: '#424242' },
]

function getColor(handle: string) {
  // Deterministic color based on handle string
  let hash = 0
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('')
}

export function CategoryCard({ id, name, handle, image }: CategoryCardProps) {
  const color = getColor(handle)
  const initials = getInitials(name)

  return (
    <LocalizedClientLink
      href={`/categories/${handle}`}
      className="group flex flex-col items-center gap-2"
    >
      <div
        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-bold text-lg
                   transition-transform duration-200 group-active:scale-95 group-hover:scale-105 overflow-hidden"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <span className="text-[11px] sm:text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2 max-w-[64px]">
        {name}
      </span>
    </LocalizedClientLink>
  )
}
