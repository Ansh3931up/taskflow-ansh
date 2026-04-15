import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/** Facebook-style shimmer skeleton — a sweeping gradient over a muted base */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted/60 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-foreground/10 before:to-transparent dark:before:via-foreground/15',
        className,
      )}
    />
  );
}
