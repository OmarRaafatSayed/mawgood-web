export const ProductListingSkeleton = () => {
  return (
    <div className="py-4" data-testid="product-listing-skeleton">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 bg-gray-200 w-24 rounded animate-pulse" />
        <div className="h-8 w-28 bg-gray-200 rounded animate-pulse hidden lg:block" />
      </div>

      {/* Grid skeleton - 2 cols mobile, 3 tablet, 4 desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-white border border-gray-100">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 bg-gray-200 rounded animate-pulse w-4/5" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/5" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
