import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { TaskStatus } from '@/types';

const selectClass =
  'h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:max-w-[200px]';

type UserOption = { id: string; name: string };

type Props = {
  statusFilter: 'all' | TaskStatus;
  assigneeFilter: 'all' | string;
  onStatusChange: (v: 'all' | TaskStatus) => void;
  onAssigneeChange: (v: 'all' | string) => void;
  onReset: () => void;
  users: UserOption[];
  tasksLoading: boolean;
};

export function ProjectFiltersToolbar({
  statusFilter,
  assigneeFilter,
  onStatusChange,
  onAssigneeChange,
  onReset,
  users,
  tasksLoading,
}: Props) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
            Filter
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <Label
              htmlFor="filter-status"
              className="whitespace-nowrap text-[11px] text-muted-foreground sm:w-14"
            >
              Status
            </Label>
            <select
              id="filter-status"
              className={selectClass}
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as 'all' | TaskStatus)}
            >
              <option value="all">All</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <Label
              htmlFor="filter-assignee"
              className="whitespace-nowrap text-[11px] text-muted-foreground sm:w-14"
            >
              Assignee
            </Label>
            <select
              id="filter-assignee"
              className={selectClass}
              value={assigneeFilter}
              onChange={(e) => onAssigneeChange(e.target.value as 'all' | string)}
            >
              <option value="all">All users</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 sm:border-0 sm:pt-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-xs text-muted-foreground"
            onClick={onReset}
          >
            Clear
          </Button>
          {tasksLoading ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Syncing…
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
