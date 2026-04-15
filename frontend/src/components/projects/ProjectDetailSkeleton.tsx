import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <div className="flex flex-wrap gap-2 pt-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((col) => (
          <div key={col} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Card className="min-h-[320px] border-dashed border-border bg-muted/20 p-3">
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
