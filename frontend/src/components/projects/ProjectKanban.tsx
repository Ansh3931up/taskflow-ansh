import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  TouchSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Clock, GripVertical, Inbox, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Task, TaskStatus } from '@/types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/constants';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/relativeTime';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

type Props = {
  tasks: Task[];
  tasksLoading: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onOpenTask: (task: Task) => void;
  assigneeName: (assigneeId: string | null) => string;
  canDeleteTask: (task: Task) => boolean;
  onDeleteTask: (taskId: string, e?: React.MouseEvent) => void;
};

function KanbanTaskCardPreview({ task }: { task: Task }) {
  return (
    <Card className="cursor-grabbing overflow-hidden border-border/80 shadow-elevated ring-2 ring-primary/20">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <span
              className={cn(
                'inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                PRIORITY_CONFIG[task.priority].color,
              )}
            >
              {PRIORITY_CONFIG[task.priority].label}
            </span>
            <p className="font-medium leading-snug text-foreground">{task.title}</p>
            {task.due_date ? (
              <p className="text-xs text-muted-foreground">Due {task.due_date.slice(0, 10)}</p>
            ) : null}
          </div>
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {task.created_at
            ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true })
            : '—'}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanTaskCard({
  task,
  assigneeName,
  canDelete,
  onOpen,
  onDelete,
}: {
  task: Task;
  assigneeName: Props['assigneeName'];
  canDelete: boolean;
  onOpen: (task: Task) => void;
  onDelete: Props['onDeleteTask'];
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={isDragging ? { opacity: 0.35 } : undefined}
      className={cn('touch-none', isDragging && 'relative z-10')}
    >
      <Card
        className={cn(
          'overflow-hidden border-border/80 shadow-sm transition-shadow',
          'cursor-grab active:cursor-grabbing',
          'hover:shadow-elevated',
        )}
      >
        <CardContent className="p-0">
          {/* Drag surface: touch-friendly (Pointer + Touch sensors on dnd-kit root) */}
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab p-3 active:cursor-grabbing"
            role="button"
            tabIndex={0}
            aria-label={`Drag to move: ${task.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onOpen(task);
            }}
            onClick={() => onOpen(task)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                <span
                  className={cn(
                    'inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                    PRIORITY_CONFIG[task.priority].color,
                  )}
                >
                  {PRIORITY_CONFIG[task.priority].label}
                </span>
                <p className="font-medium leading-snug text-foreground">{task.title}</p>
                {task.due_date ? (
                  <p className="text-xs text-muted-foreground">Due {task.due_date.slice(0, 10)}</p>
                ) : null}
              </div>
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border px-3 pb-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.created_at
                ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true })
                : '—'}
            </div>
            <div className="flex items-center gap-1">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-[10px] font-semibold text-muted-foreground"
                title={assigneeName(task.assignee_id ?? null)}
              >
                {assigneeName(task.assignee_id ?? null)
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
              {canDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => onDelete(task.id, e)}
                  aria-label="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({
  status,
  columnTasks,
  assigneeName,
  canDeleteTask,
  onOpenTask,
  onDeleteTask,
}: {
  status: TaskStatus;
  columnTasks: Task[];
  assigneeName: Props['assigneeName'];
  canDeleteTask: Props['canDeleteTask'];
  onOpenTask: Props['onOpenTask'];
  onDeleteTask: Props['onDeleteTask'];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const ColumnIcon = STATUS_CONFIG[status].icon;

  return (
    <div className="w-full min-w-0 space-y-3 sm:w-auto">
      <div className="flex items-center gap-2 px-1">
        <ColumnIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {STATUS_CONFIG[status].label}
        </h3>
        <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {columnTasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[200px] space-y-2 rounded-xl border border-border bg-muted/25 p-2 shadow-inner transition-colors sm:min-h-[400px]',
          isOver && 'border-primary/50 bg-primary/5 ring-2 ring-primary/20',
        )}
      >
        {columnTasks.map((task) => (
          <KanbanTaskCard
            key={task.id}
            task={task}
            assigneeName={assigneeName}
            canDelete={canDeleteTask(task)}
            onOpen={onOpenTask}
            onDelete={onDeleteTask}
          />
        ))}

        {columnTasks.length === 0 ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border/80 p-4 text-center text-muted-foreground">
            <Inbox className="h-5 w-5 opacity-40" aria-hidden />
            <p className="text-xs">Drop tasks here</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectKanban({
  tasks,
  tasksLoading,
  onStatusChange,
  onOpenTask,
  assigneeName,
  canDeleteTask,
  onDeleteTask,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
  );

  const activeTask = useMemo(
    () => (activeId ? (tasks.find((t) => t.id === activeId) ?? null) : null),
    [activeId, tasks],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const taskId = String(active.id);
    const overId = String(over.id);
    let nextStatus: TaskStatus | null = STATUSES.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : null;
    if (!nextStatus) {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) nextStatus = overTask.status;
    }
    if (!nextStatus) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === nextStatus) return;
    onStatusChange(taskId, nextStatus);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="relative flex flex-col gap-6 overflow-visible pb-2 pt-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-3">
        {tasksLoading && tasks.length === 0 ? (
          <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/60 pt-24 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : null}

        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            columnTasks={tasks.filter((t) => t.status === status)}
            assigneeName={assigneeName}
            canDeleteTask={canDeleteTask}
            onOpenTask={onOpenTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)' }}>
        {activeTask ? (
          <div className="max-w-[min(100vw-2rem,280px)] touch-none">
            <KanbanTaskCardPreview task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
