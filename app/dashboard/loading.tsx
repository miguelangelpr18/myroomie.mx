export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-5xl animate-pulse" aria-busy="true">
      <span className="sr-only">Cargando panel...</span>
      <div className="h-8 w-48 bg-neutral-200 rounded mb-2" />
      <div className="h-4 w-72 bg-neutral-200 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6 h-32" />
        ))}
      </div>
      <div className="h-6 w-40 bg-neutral-200 rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="aspect-[4/3] bg-neutral-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-full bg-neutral-200 rounded" />
              <div className="h-4 w-24 bg-neutral-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
