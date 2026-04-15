import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { createTask, updateTask } from '@/store/slices/taskSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AssigneePicker } from '@/components/projects/AssigneePicker';
import type { Task, TaskPriority, TaskStatus, User } from '@/types';
import type { TaskWritePayload } from '@/api/tasks';
import { cn } from '@/lib/utils';

const sheetX =
  'px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]';

const selectClass =
  'flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

type TaskSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  projectId: string;
  task: Task | null;
  users: User[];
  onCommit: () => void;
};

function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>;
}

export function TaskSheet({
  open,
  onOpenChange,
  mode,
  projectId,
  task,
  users,
  onCommit,
}: TaskSheetProps) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === 'edit' && task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assignee_id ?? '');
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setAssigneeId('');
      setDueDate('');
    }
  }, [open, mode, task]);

  if (!open) return null;

  const buildCreatePayload = (): TaskWritePayload => {
    const desc = description.trim();
    return {
      title: title.trim(),
      priority,
      assignee_id: assigneeId || null,
      due_date: dueDate || null,
      ...(desc ? { description: desc } : {}),
    };
  };

  const buildUpdatePayload = (): TaskWritePayload => {
    const desc = description.trim();
    return {
      title: title.trim(),
      description: desc || null,
      status,
      priority,
      assignee_id: assigneeId || null,
      due_date: dueDate || null,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (mode === 'create') {
        await dispatch(createTask({ projectId, data: buildCreatePayload() })).unwrap();
      } else if (task) {
        await dispatch(updateTask({ id: task.id, data: buildUpdatePayload() })).unwrap();
      }
      onCommit();
      onOpenChange(false);
    } catch (err: unknown) {
      if (typeof err === 'string') setError(err);
      else if (err && typeof err === 'object' && 'message' in err)
        setError(String((err as { message: string }).message));
      else setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  /* Portal to document.body so position:fixed is viewport-relative. Ancestors with transform
     (e.g. ProjectDetail animate-in) otherwise create a containing block and cause a strip/gap under the sticky header. */
  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        aria-label="Close panel"
        onClick={() => !saving && onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-sheet-title"
        className={cn(
          'fixed z-[110] flex min-h-0 min-w-0 flex-col border-border bg-card shadow-elevated animate-in duration-300',
          'inset-0 h-[100dvh] max-h-[100dvh] w-full max-w-[100vw]',
          'sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-lg sm:border-l',
          'slide-in-from-bottom sm:slide-in-from-right',
        )}
      >
        <header
          className={cn(
            'flex shrink-0 items-center justify-between gap-3 border-b border-border py-3 sm:py-4',
            sheetX,
            'pt-[max(0.75rem,env(safe-area-inset-top))]',
          )}
        >
          <h2
            id="task-sheet-title"
            className="min-w-0 truncate font-display text-lg font-semibold tracking-tight text-foreground"
          >
            {mode === 'create' ? 'New task' : 'Edit task'}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={saving}
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-4 sm:py-5',
              sheetX,
            )}
          >
            <div className="mx-auto flex w-full max-w-full flex-col space-y-4">
              {error ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <FieldGroup>
                <Label htmlFor="task-title" className="text-xs font-medium text-muted-foreground">
                  Title
                </Label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  required
                  disabled={saving}
                  className="h-10"
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="task-desc" className="text-xs font-medium text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="task-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details…"
                  disabled={saving}
                  rows={4}
                  className="min-h-[88px] resize-y"
                />
              </FieldGroup>

              {mode === 'edit' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-5">
                  <FieldGroup className="min-w-0">
                    <Label
                      htmlFor="task-status"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Status
                    </Label>
                    <select
                      id="task-status"
                      className={selectClass}
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      disabled={saving}
                    >
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                  </FieldGroup>
                  <FieldGroup className="min-w-0">
                    <Label
                      htmlFor="task-priority"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Priority
                    </Label>
                    <select
                      id="task-priority"
                      className={selectClass}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      disabled={saving}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </FieldGroup>
                </div>
              ) : (
                <FieldGroup>
                  <Label
                    htmlFor="task-priority"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Priority
                  </Label>
                  <select
                    id="task-priority"
                    className={selectClass}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    disabled={saving}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </FieldGroup>
              )}
            </div>
          </div>

          {/* Outside overflow-y-auto so assignee search dropdown is not clipped */}
          <div
            className={cn(
              'relative z-20 shrink-0 space-y-4 border-t border-border/60 py-4',
              sheetX,
            )}
          >
            <FieldGroup>
              <AssigneePicker
                id="task-assignee"
                users={users}
                value={assigneeId}
                onChange={setAssigneeId}
                disabled={saving}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="task-due" className="text-xs font-medium text-muted-foreground">
                Due date
              </Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={saving}
                className="h-10"
              />
            </FieldGroup>
          </div>

          <footer
            className={cn(
              'flex shrink-0 flex-col gap-3 border-t border-border bg-muted/20 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3',
              sheetX,
              'pb-[max(1rem,env(safe-area-inset-bottom))]',
            )}
          >
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full shrink-0 sm:w-auto sm:min-w-[6.5rem]"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 w-full shrink-0 sm:w-auto sm:min-w-[9.5rem]"
              disabled={saving}
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create task' : 'Save changes'}
            </Button>
          </footer>
        </form>
      </div>
    </>,
    document.body,
  );
}
