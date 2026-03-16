export default function ListingDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl animate-pulse" aria-busy="true">
      <span className="sr-only">Cargando anuncio...</span>
      <div className="h-4 w-32 bg-neutral-200 rounded mb-6" />
      <div className="mb-6">
        <div className="flex gap-3 mb-4">
          <div className="h-7 w-24 bg-neutral-200 rounded-full" />
        </div>
        <div className="h-9 w-3/4 bg-neutral-200 rounded mb-3" />
        <div className="h-8 w-32 bg-neutral-200 rounded mb-2" />
        <div className="h-4 w-48 bg-neutral-200 rounded" />
      </div>
      <div className="aspect-[16/9] w-full bg-neutral-200 rounded-2xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-neutral-100 rounded-xl h-48" />
          <div className="bg-neutral-100 rounded-xl h-32" />
        </div>
        <div className="bg-neutral-100 rounded-xl h-64" />
      </div>
    </div>
  )
}
