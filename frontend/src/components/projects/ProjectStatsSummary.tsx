import { LayoutDashboard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ProjectStats } from '@/store/slices/projectSlice';
import type { TaskStatus } from '@/types';
import { STATUS_CONFIG } from '@/constants';

type Props = {
  stats: ProjectStats;
  statusBreakdown: { status: TaskStatus; count: number }[];
};

export function ProjectStatsSummary({ stats, statusBreakdown }: Props) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-3 p-3 sm:p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LayoutDashboard className="h-4 w-4 text-foreground/70" aria-hidden />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/90">
            Summary
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusBreakdown.map(({ status, count }) => {
            const Icon = STATUS_CONFIG[status].icon;
            return (
              <div
                key={status}
                className="flex min-w-[7.5rem] flex-1 items-center gap-2 rounded-md border border-border/80 bg-muted/30 px-3 py-2 sm:min-w-[8rem]"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {STATUS_CONFIG[status].label}
                  </p>
                  <p className="font-display text-lg font-semibold tabular-nums leading-none text-foreground">
                    {count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border/60 pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            By assignee
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(stats.unassigned_count ?? 0) > 0 ? (
              <span className="rounded-md border border-dashed border-border bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
                Unassigned · {stats.unassigned_count}
              </span>
            ) : null}
            {stats.by_assignee?.map((row) => (
              <span
                key={row.assignee_id}
                className="rounded-md border border-border/80 bg-card px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {row.assignee_name || 'User'} · {row.count}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
