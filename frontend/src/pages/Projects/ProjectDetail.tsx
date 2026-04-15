import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit3,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Clock,
  Save,
  X,
  Inbox,
  GripVertical,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTasks,
  updateTask,
  deleteTask,
  clearTasks,
  clearTaskError,
} from '@/store/slices/taskSlice';
import { updateProject, deleteProject, fetchProjectStats } from '@/store/slices/projectSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import { projectsApi } from '@/api/projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaskSheet } from '@/components/projects/TaskSheet';
import { ProjectDetailSkeleton } from '@/components/projects/ProjectDetailSkeleton';
import { ProjectFiltersToolbar } from '@/components/projects/ProjectFiltersToolbar';
import { ProjectStatsSummary } from '@/components/projects/ProjectStatsSummary';
import { TaskListRow } from '@/components/projects/TaskListRow';
import type { Project, Task, TaskStatus } from '@/types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/constants';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function ProjectDetailContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((s) => s.auth);
  const {
    items: tasks,
    loading: tasksLoading,
    error: tasksError,
    total: tasksTotal,
  } = useAppSelector((s) => s.tasks);
  const { items: users } = useAppSelector((s) => s.users);
  const { stats } = useAppSelector((s) => s.projects);

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | string>('all');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const refreshStats = useCallback(() => {
    dispatch(fetchProjectStats(id));
  }, [dispatch, id]);

  useEffect(() => {
    let cancelled = false;

    projectsApi
      .getById(id)
      .then((res) => {
        if (cancelled) return;
        setProject(res);
        setProjectError(null);
        setProjectLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setProject(null);
        setProjectError('Project could not be loaded.');
        setProjectLoading(false);
      });

    dispatch(fetchUsers());

    return () => {
      cancelled = true;
      dispatch(clearTasks());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (!project?.id) return;
    dispatch(fetchProjectStats(id));
  }, [id, project?.id, dispatch]);

  useEffect(() => {
    if (sheetOpen) return;
    const intervalMs = 28_000;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      dispatch(
        fetchTasks({
          projectId: id,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          assignee: assigneeFilter !== 'all' ? assigneeFilter : undefined,
          limit: 100,
        }),
      );
      dispatch(fetchProjectStats(id));
    };
    const handle = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(handle);
  }, [id, sheetOpen, statusFilter, assigneeFilter, dispatch]);

  useEffect(() => {
    dispatch(clearTaskError());
    dispatch(
      fetchTasks({
        projectId: id,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        assignee: assigneeFilter !== 'all' ? assigneeFilter : undefined,
        limit: 100,
      }),
    );
  }, [id, statusFilter, assigneeFilter, dispatch]);

  const openCreateSheet = () => {
    setEditingTask(null);
    setSheetMode('create');
    setSheetOpen(true);
  };

  const openEditSheet = (task: Task) => {
    setEditingTask(task);
    setSheetMode('edit');
    setSheetOpen(true);
  };

  const handleStatusToggle = (task: Task) => {
    const next: Record<TaskStatus, TaskStatus> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    };
    void dispatch(updateTask({ id: task.id, data: { status: next[task.status] } })).then(() =>
      refreshStats(),
    );
  };

  const handleDeleteTask = async (taskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !canDeleteTask(task)) return;
    if (!confirm('Delete this task?')) return;
    await dispatch(deleteTask(taskId));
    refreshStats();
  };

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    void dispatch(updateTask({ id: taskId, data: { status: newStatus } })).then(() =>
      refreshStats(),
    );
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const startEditing = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDesc(project.description || '');
    setIsEditing(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProjectOwner) return;
    if (!editName.trim()) return;
    const result = await dispatch(
      updateProject({ id, data: { name: editName, description: editDesc } }),
    );
    if (updateProject.fulfilled.match(result)) {
      setProject(result.payload);
      setIsEditing(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!isProjectOwner) return;
    if (!confirm('Delete this project and all tasks?')) return;
    const result = await dispatch(deleteProject(id));
    if (deleteProject.fulfilled.match(result)) {
      navigate('/projects');
    }
  };

  const assigneeName = (assigneeId: string | null | undefined) => {
    if (!assigneeId) return 'Unassigned';
    return users.find((u) => u.id === assigneeId)?.name ?? 'Unknown';
  };

  const statusBreakdown = useMemo(() => {
    if (!stats?.by_status) return [];
    const m = new Map(stats.by_status.map((r) => [r.status, r.count]));
    return (['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => ({
      status: s,
      count: m.get(s) ?? 0,
    }));
  }, [stats]);

  const isProjectOwner = !!(user?.id && project?.owner_id === user.id);

  const canDeleteTask = (task: Task) =>
    isProjectOwner || (!!user?.id && !!task.creator_id && task.creator_id === user.id);

  if (projectLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (projectError || !project) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-16 text-center">
        <Alert variant="destructive">
          <AlertDescription>{projectError || 'Project not found.'}</AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link to="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 animate-in fade-in duration-300">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link to="/projects" className="hover:text-primary">
              Projects
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-foreground">{project.name}</span>
          </div>

          {project && user && !isProjectOwner ? (
            <p className="text-xs text-muted-foreground">
              You have access as a collaborator. Only the project owner can rename or delete this
              project.
            </p>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {isEditing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-12 max-w-xl text-2xl font-semibold"
                  autoFocus
                />
              ) : (
                project.name
              )}
            </h1>
          </div>

          <div className="max-w-2xl">
            {isEditing ? (
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="mt-2 max-w-xl"
                placeholder="Description"
              />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {project.description?.trim() || 'No description yet.'}
              </p>
            )}
            {isEditing ? (
              <div className="mt-4 flex gap-2">
                <Button type="button" size="sm" onClick={handleUpdateProject}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-border p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn('h-8 gap-1.5 px-3', viewMode === 'list' && 'bg-muted')}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-3.5 w-3.5" />
              List
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn('h-8 gap-1.5 px-3', viewMode === 'kanban' && 'bg-muted')}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Board
            </Button>
          </div>
          <Button type="button" size="sm" onClick={openCreateSheet}>
            <Plus className="h-4 w-4" />
            Add task
          </Button>
          {!isEditing && isProjectOwner ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={startEditing}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={handleDeleteProject}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <ProjectFiltersToolbar
        statusFilter={statusFilter}
        assigneeFilter={assigneeFilter}
        onStatusChange={setStatusFilter}
        onAssigneeChange={setAssigneeFilter}
        onReset={() => {
          setStatusFilter('all');
          setAssigneeFilter('all');
        }}
        users={users}
        tasksLoading={tasksLoading}
      />

      {tasksError ? (
        <Alert variant="destructive">
          <AlertDescription>{tasksError}</AlertDescription>
        </Alert>
      ) : null}

      {stats ? <ProjectStatsSummary stats={stats} statusBreakdown={statusBreakdown} /> : null}

      <p className="text-center text-xs text-muted-foreground sm:text-left">
        Showing {tasks.length} of {tasksTotal || tasks.length} task{tasks.length === 1 ? '' : 's'}{' '}
        for the current filters. Board and counts refresh about every 28s while this tab is visible.
      </p>

      {viewMode === 'kanban' ? (
        <div className="relative -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible pb-2 pt-1 scroll-smooth sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {tasksLoading && tasks.length === 0 ? (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/60 pt-24 backdrop-blur-[1px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : null}
          {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            const ColumnIcon = STATUS_CONFIG[status].icon;
            return (
              <div
                key={status}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, status)}
                className="w-[min(100%,280px)] shrink-0 snap-center space-y-3 sm:w-auto sm:min-w-0"
              >
                <div className="flex items-center gap-2 px-1">
                  <ColumnIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {STATUS_CONFIG[status].label}
                  </h3>
                  <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="min-h-[min(400px,55vh)] space-y-2 rounded-xl border border-border bg-muted/25 p-2 shadow-inner sm:min-h-[400px]">
                  {columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      className="cursor-grab overflow-hidden border-border/80 shadow-sm transition-all hover:-translate-y-px hover:shadow-elevated active:cursor-grabbing"
                    >
                      <CardContent className="p-3">
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => openEditSheet(task)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') openEditSheet(task);
                          }}
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
                              <p className="font-medium leading-snug text-foreground">
                                {task.title}
                              </p>
                              {task.due_date ? (
                                <p className="text-xs text-muted-foreground">
                                  Due {task.due_date.slice(0, 10)}
                                </p>
                              ) : null}
                            </div>
                            <GripVertical
                              className="h-4 w-4 shrink-0 text-muted-foreground/40"
                              aria-hidden
                            />
                          </div>
                        </button>

                        <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {task.created_at
                              ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true })
                              : '—'}
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-[10px] font-semibold text-muted-foreground"
                              title={assigneeName(task.assignee_id)}
                            >
                              {assigneeName(task.assignee_id).slice(0, 1).toUpperCase()}
                            </span>
                            {canDeleteTask(task) ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={(e) => handleDeleteTask(task.id, e)}
                                aria-label="Delete task"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {columnTasks.length === 0 ? (
                    <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border/80 p-4 text-center text-muted-foreground">
                      <Inbox className="h-5 w-5 opacity-40" aria-hidden />
                      <p className="text-xs">No tasks</p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden border-border/80 shadow-elevated">
          <div className="hidden border-b border-border bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4">
            <div>Task</div>
            <div>Assignee</div>
            <div>Status</div>
            <div>Priority</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="space-y-3 p-3 sm:space-y-0 sm:divide-y sm:divide-border sm:p-0">
            {tasks.length === 0 ? (
              <div className="px-2 py-12 text-center text-sm text-muted-foreground sm:px-4">
                No tasks match these filters.
              </div>
            ) : (
              tasks.map((task) => (
                <TaskListRow
                  key={task.id}
                  task={task}
                  assigneeLabel={assigneeName(task.assignee_id)}
                  canDelete={canDeleteTask(task)}
                  onOpen={() => openEditSheet(task)}
                  onAdvanceStatus={() => handleStatusToggle(task)}
                  onDelete={(e) => handleDeleteTask(task.id, e)}
                />
              ))
            )}
          </div>
        </Card>
      )}

      <TaskSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        projectId={id}
        task={editingTask}
        users={users}
        onCommit={() => {
          refreshStats();
          dispatch(
            fetchTasks({
              projectId: id,
              status: statusFilter !== 'all' ? statusFilter : undefined,
              assignee: assigneeFilter !== 'all' ? assigneeFilter : undefined,
              limit: 100,
            }),
          );
        }}
      />
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <Navigate to="/projects" replace />;
  }
  return <ProjectDetailContent key={id} id={id} />;
}
