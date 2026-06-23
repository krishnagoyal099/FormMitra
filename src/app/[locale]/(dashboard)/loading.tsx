// src/app/(dashboard)/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 shimmer rounded-md" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 shimmer rounded-xl" />)}
      </div>
      <div className="h-64 shimmer rounded-xl" />
    </div>
  );
}
