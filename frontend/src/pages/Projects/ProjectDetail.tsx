import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit3,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Save,
  X,
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
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaskSheet } from '@/components/projects/TaskSheet';
import { ProjectDetailSkeleton } from '@/components/projects/ProjectDetailSkeleton';
import { ProjectFiltersToolbar } from '@/components/projects/ProjectFiltersToolbar';
import { ProjectStatsSummary } from '@/components/projects/ProjectStatsSummary';
import { ProjectKanban } from '@/components/projects/ProjectKanban';
import { TaskListRow } from '@/components/projects/TaskListRow';
import type { Project, Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

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

  const startEditing = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDesc(project.description || '');
    setIsEditing(true);
  };

  const handleUpdateProject = async () => {
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
                <Button type="button" size="sm" onClick={() => void handleUpdateProject()}>
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
        <ProjectKanban
          tasks={tasks}
          tasksLoading={tasksLoading}
          onStatusChange={(taskId, status) => {
            void dispatch(updateTask({ id: taskId, data: { status } })).then(() => refreshStats());
          }}
          onOpenTask={openEditSheet}
          assigneeName={assigneeName}
          canDeleteTask={canDeleteTask}
          onDeleteTask={handleDeleteTask}
        />
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
