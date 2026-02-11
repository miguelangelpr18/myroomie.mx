export default function ListingsLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-16" aria-busy="true">
      <span className="sr-only">Cargando anuncios...</span>

      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-4 animate-pulse">
        <div className="flex-1">
          <div className="h-8 w-48 bg-muted/30 rounded-lg mb-2" />
          <div className="h-4 w-72 max-w-full bg-muted/30 rounded" />
        </div>
        <div className="h-10 w-36 bg-muted/30 rounded-lg shrink-0 ml-4" />
      </div>

      {/* Result row / chips skeleton */}
      <div className="mb-6 flex flex-wrap items-center gap-2 animate-pulse">
        <div className="h-4 w-44 bg-muted/30 rounded" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-20 bg-muted/30 rounded-full" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-muted/20 bg-muted/5 shadow-sm overflow-hidden animate-pulse"
          >
            {/* Image placeholder */}
            <div className="aspect-[4/3] w-full bg-muted/30 rounded-t-2xl" />
            {/* Content */}
            <div className="p-4">
              <div className="h-6 w-24 bg-muted/30 rounded-full mb-3" />
              <div className="h-5 w-full bg-muted/30 rounded mb-2" />
              <div className="h-5 w-4/5 bg-muted/30 rounded mb-2" />
              <div className="h-3 w-32 bg-muted/30 rounded mb-3" />
              <div className="h-4 w-full bg-muted/20 rounded mb-1" />
              <div className="h-4 w-2/3 bg-muted/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
