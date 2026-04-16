export default function Loading() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border">
              <div className="h-[220px] animate-pulse bg-gray-200" />
              <div className="p-4">
                <div className="mb-3 h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="mb-2 h-6 w-full animate-pulse rounded bg-gray-200" />
                <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
