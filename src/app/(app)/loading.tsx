export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading clients">
      <div className="skeleton mb-2 h-8 w-40" />
      <div className="skeleton mb-6 h-4 w-80 max-w-full" />
      <div className="skeleton mb-3 h-11" />
      <div className="skeleton mb-5 h-8 w-72 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card h-40 p-5">
            <div className="flex gap-3">
              <div className="skeleton size-12 rounded-xl" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
