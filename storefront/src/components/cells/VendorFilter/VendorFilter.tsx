'use client'

import { useEffect, useState } from 'react'
import useFilters from '@/hooks/useFilters'
import { getSellerByHandle } from '@/lib/data/seller'
import { SellerProps } from '@/types/seller'

interface VendorFilterProps {
  className?: string
}

export const VendorFilter = ({ className }: VendorFilterProps) => {
  const { updateFilters, filters, isFilterActive } = useFilters('seller_id')
  const [vendors, setVendors] = useState<SellerProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        // Fetch active vendors from the backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/vendors?limit=50`)
        const data = await response.json()
        
        if (data.sellers) {
          setVendors(data.sellers)
        }
      } catch (error) {
        console.error('Error fetching vendors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [])

  if (loading || vendors.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold mb-3">Vendor</h3>
      <div className="space-y-2">
        {vendors.map((vendor) => {
          const isActive = isFilterActive(vendor.id)
          
          return (
            <label
              key={vendor.id}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => updateFilters(vendor.id)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                {vendor.name}
              </span>
              {vendor.photo && (
                <img
                  src={vendor.photo}
                  alt={vendor.name}
                  className="w-6 h-6 rounded-full ml-auto object-cover"
                />
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}
