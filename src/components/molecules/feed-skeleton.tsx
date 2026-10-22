export function SkeletonCard() {
  return (
    <div
      aria-hidden
      className="rounded-lg border border-divider bg-surface p-5"
    >
      <div className="flex animate-pulse flex-col gap-4 motion-reduce:animate-none">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-full bg-rail-item" />
          <div className="flex flex-col gap-2">
            <span className="h-2.5 w-24 rounded-full bg-rail-item" />
            <span className="h-2 w-16 rounded-full bg-rail-item" />
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="h-2.5 w-11/12 rounded-full bg-rail-item" />
          <span className="h-2.5 w-4/5 rounded-full bg-rail-item" />
          <span className="h-2.5 w-1/2 rounded-full bg-rail-item" />
        </div>
        <span className="h-2 w-28 rounded-full bg-rail-item" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((card) => (
        <SkeletonCard key={card} />
      ))}
    </div>
  );
}
