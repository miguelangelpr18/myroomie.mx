export default function MessagesLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl animate-pulse" aria-busy="true">
      <span className="sr-only">Cargando mensajes...</span>
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:h-[calc(100vh-220px)]">
        <aside className="rounded-2xl border border-neutral-200 bg-white overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-neutral-200">
            <div className="h-6 w-32 bg-neutral-200 rounded mb-2" />
            <div className="h-4 w-48 bg-neutral-200 rounded" />
            <div className="mt-3 h-9 w-full bg-neutral-200 rounded-lg" />
          </div>
          <div className="divide-y divide-neutral-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 bg-neutral-200 rounded" />
                  <div className="h-3 w-40 bg-neutral-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="hidden lg:block rounded-2xl border border-neutral-200 bg-white" />
      </div>
    </div>
  )
}
