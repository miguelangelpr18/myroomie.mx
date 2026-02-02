export default function ExploreLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-16 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <div className="h-8 w-64 bg-neutral-200 rounded-lg mb-2" />
          <div className="h-4 w-96 bg-neutral-200 rounded" />
        </div>
        <div className="h-10 w-40 bg-neutral-200 rounded-lg" />
      </div>

      {/* Chips skeleton */}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 bg-neutral-200 rounded-full" />
        ))}
      </div>

      {/* Result header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-5 w-48 bg-neutral-200 rounded" />
        <div className="h-9 w-20 bg-neutral-200 rounded-lg" />
      </div>

      {/* Grid skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
            {/* Avatar skeleton */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-full" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-neutral-200 rounded mb-2" />
                <div className="h-4 w-24 bg-neutral-200 rounded" />
              </div>
            </div>

            {/* Badges skeleton */}
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-16 bg-neutral-200 rounded-full" />
              <div className="h-6 w-20 bg-neutral-200 rounded-full" />
            </div>

            {/* Location skeleton */}
            <div className="h-4 w-40 bg-neutral-200 rounded mb-4" />

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-neutral-200 rounded" />
              <div className="h-4 w-3/4 bg-neutral-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



