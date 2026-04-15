import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Matches auth card layout while lazy chunks load or during heavy transitions. */
export function AuthCardSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
          <CardFooter className="border-t border-border bg-muted/20 py-4">
            <Skeleton className="mx-auto h-4 w-48" />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
