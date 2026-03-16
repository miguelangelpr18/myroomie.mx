export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse" aria-busy="true">
      <span className="sr-only">Cargando perfil...</span>
      <div className="h-4 w-24 bg-neutral-200 rounded mb-6" />
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-24 h-24 rounded-full bg-neutral-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-48 bg-neutral-200 rounded" />
            <div className="h-4 w-32 bg-neutral-200 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-neutral-200 rounded-full" />
              <div className="h-6 w-16 bg-neutral-200 rounded-full" />
            </div>
          </div>
        </div>
        <div className="h-9 w-32 bg-neutral-200 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 h-32" />
      <div className="h-6 w-48 bg-neutral-200 rounded mb-4" />
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="aspect-[4/3] bg-neutral-200" />
            <div className="p-4 space-y-2">
              <div className="h-6 w-20 bg-neutral-200 rounded-full" />
              <div className="h-5 w-full bg-neutral-200 rounded" />
              <div className="h-4 w-32 bg-neutral-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
