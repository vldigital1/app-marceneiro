export function CardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <div className="aspect-[4/3] animate-pulse bg-wood-100" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-wood-100" />
        <div className="h-3 w-full animate-pulse rounded bg-wood-100" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-wood-100" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-wood-100" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-wood-100" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Carregando projetos">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
