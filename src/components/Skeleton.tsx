export function MovieCardSkeleton() {
  return (
    <div className="skeleton" style={{ width: 160, height: 240, borderRadius: 10, flexShrink: 0 }} />
  );
}

export function MovieRowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="skeleton w-full" style={{ height: '70vh', borderRadius: 0 }} />
  );
}

export function DetailHeroSkeleton() {
  return (
    <div>
      <div className="skeleton w-full" style={{ height: 520 }} />
      <div className="p-8 space-y-4">
        <div className="skeleton" style={{ height: 36, width: '50%' }} />
        <div className="skeleton" style={{ height: 20, width: '30%' }} />
        <div className="skeleton" style={{ height: 80, width: '80%' }} />
      </div>
    </div>
  );
}

export function PersonCardSkeleton() {
  return (
    <div style={{ width: 140, flexShrink: 0 }}>
      <div className="skeleton" style={{ width: 140, height: 140, borderRadius: '50%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '70%', margin: '0 auto' }} />
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="flex gap-4 items-start">
      <div className="skeleton" style={{ width: 80, height: 120, borderRadius: 8, flexShrink: 0 }} />
      <div className="flex-1 space-y-2 pt-1">
        <div className="skeleton" style={{ height: 18, width: '60%' }} />
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ height: 14, width: '90%' }} />
        <div className="skeleton" style={{ height: 14, width: '75%' }} />
      </div>
    </div>
  );
}
