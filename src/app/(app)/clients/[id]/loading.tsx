export default function ClientLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading client">
      <div className="skeleton h-4 w-24" />
      <div className="card overflow-hidden">
        <div className="skeleton h-24 rounded-none" />
        <div className="flex items-end gap-4 px-6 pb-6">
          <div className="skeleton -mt-10 size-20 rounded-xl ring-4 ring-surface" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-4 w-64 max-w-full" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card h-40 lg:col-span-2" />
        <div className="card h-40" />
      </div>
      <div className="card h-56" />
    </div>
  );
}
