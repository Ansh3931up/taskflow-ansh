import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjects, createProject, deleteProject } from '@/store/slices/projectSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Trash2,
  Search,
  LayoutGrid,
  List as ListIcon,
  ArrowUpRight,
  Clock,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

export function ProjectsList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { items, loading, loadingMore, error, listMeta } = useAppSelector(
    (state) => state.projects,
  );

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchProjects({ page: 1, limit: PAGE_SIZE }));
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [items, query]);

  const total = listMeta?.total ?? items.length;
  const hasMore = listMeta ? items.length < listMeta.total : false;

  const handleLoadMore = () => {
    if (!listMeta || loadingMore) return;
    const nextPage = listMeta.page + 1;
    dispatch(fetchProjects({ page: nextPage, limit: listMeta.limit, append: true }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const result = await dispatch(createProject({ name: newName, description: newDesc }));
    setCreating(false);
    if (createProject.fulfilled.match(result)) {
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      navigate(`/projects/${result.payload.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    await dispatch(deleteProject(projectId));
  };

  if (loading && items.length === 0) {
    return (
      <div className="space-y-6 px-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-48 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full max-w-md rounded-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-1 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Projects
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Open a project to manage tasks. Showing {items.length} of {total} loaded
            {query.trim() ? ' (search filters this page)' : ''}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card/50 p-0.5 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('h-9 w-9 rounded-md', viewMode === 'grid' && 'bg-muted shadow-sm')}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('h-9 w-9 rounded-md', viewMode === 'list' && 'bg-muted shadow-sm')}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button type="button" className="shadow-sm" onClick={() => setShowCreate((s) => !s)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </div>
      </div>

      <div className="relative max-w-full sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-11 pl-9 shadow-sm"
          placeholder="Search loaded projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search projects"
        />
      </div>

      {showCreate && (
        <Card className="shadow-elevated border-border/80">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleCreate} className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="new-project-name">Name</Label>
                <Input
                  id="new-project-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="e.g. Website redesign"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="new-project-desc">Description (optional)</Label>
                <Input
                  id="new-project-desc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Short summary"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={creating}
                  className="min-h-11 min-w-[100px] shadow-sm"
                >
                  {creating ? 'Creating…' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {items.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center shadow-inner sm:py-20">
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <p className="mt-1 max-w-sm px-4 text-sm text-muted-foreground">
            Create one to start tracking tasks.
          </p>
          <Button type="button" className="mt-6 shadow-md" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects match your search on this page.</p>
      ) : (
        <>
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'flex flex-col gap-3',
            )}
          >
            {filtered.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="group block min-w-0">
                <Card
                  className={cn(
                    'h-full border-border/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated',
                    viewMode === 'list' && 'py-0.5',
                  )}
                >
                  <CardContent
                    className={cn(
                      'p-4 sm:p-5',
                      viewMode === 'list' &&
                        'flex flex-row flex-wrap items-center justify-between gap-4 py-4',
                    )}
                  >
                    <div
                      className={cn(
                        'min-w-0',
                        viewMode === 'list' ? 'flex flex-1 items-center gap-4' : 'space-y-3',
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/80 shadow-sm">
                        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                          {project.name}
                        </h2>
                        {viewMode === 'grid' && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {project.description || 'No description'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={cn(
                        'flex w-full items-center justify-between gap-3 sm:w-auto',
                        viewMode === 'grid' && 'mt-4 border-t border-border pt-4 sm:mt-5',
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {project.created_at
                            ? `${formatDistanceToNow(new Date(project.created_at))} ago`
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {user?.id === project.owner_id ? (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, project.id)}
                            className="inline-flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:min-h-0 sm:min-w-0"
                            aria-label="Delete project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/80 text-muted-foreground shadow-sm transition-colors group-hover:border-primary/40 group-hover:text-primary">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {hasMore && !query.trim() ? (
            <div className="flex justify-center pt-4">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 px-8 shadow-sm"
                disabled={loadingMore}
                onClick={handleLoadMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  'Load more projects'
                )}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
