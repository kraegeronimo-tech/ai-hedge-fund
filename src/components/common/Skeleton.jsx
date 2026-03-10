export function Skeleton({ className = '', h = 'h-4', w = 'w-full' }) {
  return <div className={`skeleton rounded ${h} ${w} ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-navy-900 border border-navy-700 p-4 space-y-3">
      <Skeleton h="h-5" w="w-1/3" />
      <Skeleton h="h-8" w="w-2/3" />
      <div className="flex gap-4">
        <Skeleton h="h-4" w="w-1/4" />
        <Skeleton h="h-4" w="w-1/4" />
      </div>
    </div>
  );
}
