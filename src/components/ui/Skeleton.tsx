import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-r from-mist/60 via-mist/30 to-mist/60 bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-4 group">
      <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-mist/60 via-mist/30 to-mist/60 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>
      <div className="space-y-2.5 px-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function DashboardTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-mist/50">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-9 w-24 mb-2 rounded-lg" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="h-screen min-h-[680px] bg-ebony flex items-center justify-center">
      <div className="text-center space-y-6">
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-20 w-96 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  );
}
