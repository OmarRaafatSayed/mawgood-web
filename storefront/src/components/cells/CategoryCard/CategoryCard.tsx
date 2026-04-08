'use client'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { useTranslations } from 'next-intl'

interface CategoryCardProps {
  id: string
  name: string
  handle: string
  icon?: string
  image?: string
}

export function CategoryCard({ id, name, handle, icon, image }: CategoryCardProps) {
  const t = useTranslations('categories')
  
  // Use provided icon or default to category-specific emoji
  const displayIcon = icon || getCategoryDefaultIcon(handle)
  
  return (
    <LocalizedClientLink
      href={`/categories/${handle}`}
      className="group flex flex-col items-center justify-center p-4 bg-white rounded-2xl 
                 border border-gray-100 hover:border-[#FF8A00]/30 hover:bg-[#FF8A00]/5 
                 transition-all duration-300 ease-out shadow-sm hover:shadow-md
                 min-w-[100px] sm:min-w-[120px] flex-1"
    >
      <div className="relative mb-3 transition-transform duration-300 group-hover:scale-110">
        {image ? (
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#FF8A00]/10 to-[#FF8A00]/20 
                       flex items-center justify-center"
          >
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#FF8A00]/10 to-[#FF8A00]/20 
                       flex items-center justify-center text-2xl sm:text-3xl
                       group-hover:from-[#FF8A00]/20 group-hover:to-[#FF8A00]/30
                       transition-all duration-300"
          >
            {displayIcon}
          </div>
        )}
        {/* Orange accent ring on hover */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-[#FF8A00] opacity-0 
                     group-hover:opacity-100 transition-opacity duration-300 scale-105"
        />
      </div>
      <span 
        className="text-xs sm:text-sm font-medium text-gray-700 text-center 
                   group-hover:text-[#FF8A00] transition-colors duration-300
                   line-clamp-2 max-w-full"
      >
        {name}
      </span>
    </LocalizedClientLink>
  )
}

// Helper function to get default icon for category handle
function getCategoryDefaultIcon(handle: string): string {
  const iconMap: Record<string, string> = {
    // Fashion
    'fashion': '👕',
    'fashion-women': '👗',
    'fashion-men': '👔',
    'clothing': '👕',
    'shoes': '👟',
    'accessories': '👜',
    'jewelry': '💍',
    'watches': '⌚',
    
    // Electronics
    'electronics': '📱',
    'phones': '📱',
    'computers': '💻',
    'tablets': '📱',
    'audio': '🎧',
    'cameras': '📷',
    'gaming': '🎮',
    
    // Home & Living
    'home': '🏠',
    'kitchen': '🍳',
    'furniture': '🛋️',
    'decor': '🖼️',
    'garden': '🌿',
    'bedding': '🛏️',
    
    // Beauty & Health
    'beauty': '💄',
    'skincare': '🧴',
    'makeup': '💋',
    'fragrance': '🌸',
    'health': '💊',
    'wellness': '🧘',
    
    // Sports & Outdoors
    'sports': '⚽',
    'fitness': '🏋️',
    'outdoors': '🏕️',
    'cycling': '🚴',
    'running': '🏃',
    'yoga': '🧘',
    
    // Kids & Baby
    'kids': '🧒',
    'baby': '👶',
    'toys': '🧸',
    'games': '🎲',
    'books': '📚',
    
    // Food & Grocery
    'grocery': '🛒',
    'food': '🍎',
    'snacks': '🍿',
    'beverages': '🥤',
    
    // Automotive
    'automotive': '🚗',
    'car-accessories': '🔧',
    'motorcycle': '🏍️',
    
    // Pets
    'pets': '🐾',
    'pet-supplies': '🦴',
    
    // Office
    'office': '📎',
    'stationery': '✏️',
    
    // Default
    'default': '📦'
  }
  
  // Try exact match first
  if (iconMap[handle]) {
    return iconMap[handle]
  }
  
  // Try partial match
  for (const [key, icon] of Object.entries(iconMap)) {
    if (handle.includes(key)) {
      return icon
    }
  }
  
  return iconMap['default']
}
