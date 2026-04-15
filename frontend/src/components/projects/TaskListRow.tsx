import { User as UserIcon, ChevronsRight, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Task } from '@/types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/constants';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  task: Task;
  assigneeLabel: string;
  canDelete: boolean;
  onOpen: () => void;
  onAdvanceStatus: () => void;
  onDelete: (e: React.MouseEvent) => void;
};

export function TaskListRow({
  task,
  assigneeLabel,
  canDelete,
  onOpen,
  onAdvanceStatus,
  onDelete,
}: Props) {
  const created = task.created_at
    ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true })
    : null;
  const StatusIcon = STATUS_CONFIG[task.status].icon;

  return (
    <div>
      {/* Mobile: issue-style card */}
      <Card className="border-border/70 shadow-sm sm:hidden">
        <CardContent className="space-y-3 p-3">
          <button type="button" className="w-full text-left" onClick={onOpen}>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
                <StatusIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'font-medium leading-snug text-foreground',
                    task.status === 'done' && 'text-muted-foreground line-through',
                  )}
                >
                  {task.title}
                </p>
                {created ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" aria-hidden />
                    {created}
                  </p>
                ) : null}
              </div>
            </div>
          </button>

          <dl className="grid grid-cols-[5.5rem_1fr] gap-x-2 gap-y-2 text-sm">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Assignee
            </dt>
            <dd className="text-foreground">{assigneeLabel}</dd>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </dt>
            <dd>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  STATUS_CONFIG[task.status].color,
                )}
              >
                <StatusIcon className="h-3 w-3" aria-hidden />
                {STATUS_CONFIG[task.status].label}
              </span>
            </dd>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Priority
            </dt>
            <dd>
              <span
                className={cn(
                  'inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  PRIORITY_CONFIG[task.priority].color,
                )}
              >
                {PRIORITY_CONFIG[task.priority].label}
              </span>
            </dd>
          </dl>

          <div className="flex justify-end gap-1 border-t border-border/60 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onAdvanceStatus}
              aria-label="Move to next status"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            {canDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive"
                onClick={onDelete}
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Desktop: table row */}
      <div
        role="button"
        tabIndex={0}
        className="hidden cursor-pointer grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/25 sm:grid"
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpen();
        }}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
            <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                'font-medium text-foreground',
                task.status === 'done' && 'text-muted-foreground line-through',
              )}
            >
              {task.title}
            </p>
            <p className="text-xs text-muted-foreground">{created ?? ''}</p>
          </div>
        </div>
        <div className="text-sm text-foreground">{assigneeLabel}</div>
        <div className="flex justify-center">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              STATUS_CONFIG[task.status].color,
            )}
          >
            <StatusIcon className="h-3 w-3" aria-hidden />
            {STATUS_CONFIG[task.status].label}
          </span>
        </div>
        <div className="flex justify-center">
          <span
            className={cn(
              'inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              PRIORITY_CONFIG[task.priority].color,
            )}
          >
            {PRIORITY_CONFIG[task.priority].label}
          </span>
        </div>
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onAdvanceStatus}
            aria-label="Move to next status"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
          {canDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
