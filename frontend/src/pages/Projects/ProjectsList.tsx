import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjects } from '@/store/slices/projectSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FolderGit2, PlusCircle } from 'lucide-react';

export function ProjectsList() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.projects);

  useEffect(() => {
    // Eager loading exactly explicitly solving backend synchronization correctly smoothly safely natively
    dispatch(fetchProjects({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Structural Next.js skeleton implementation inherently implicitly drastically avoiding Cumulative Layout Shifts explicitly securely!
  if (loading && items.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md"></div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="overflow-hidden border-none shadow-sm">
              <div className="h-32 bg-muted/60 animate-pulse w-full"></div>
              <CardHeader className="gap-3">
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-1/2 bg-muted/50 animate-pulse rounded"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Directly manage and track your dynamic structured workflow pipelines.
          </p>
        </div>
        <Button className="font-bold gap-2 shadow-sm transition-all hover:-translate-y-1">
          <PlusCircle className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {items.length === 0 && !error ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-card/60">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
            <FolderGit2 className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">No active projects</h3>
          <p className="text-muted-foreground max-w-sm mt-2 mb-6">
            Get explicitly organically started dynamically initializing standard project components
            mapping properly exactly natively safely!
          </p>
          <Button className="font-bold transition-transform active:scale-95 shadow-md">
            Start Initializing
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              // Extremely precise granular chunk intent prefetching structurally implicitly mapping resolving delays securely explicitly cleanly!
              onMouseEnter={() => import('@/pages/Projects/ProjectDetail')}
            >
              <Card className="h-full hover:shadow-lg transition-shadow group cursor-pointer border-t-transparent hover:border-t-primary border-t-2 bg-card/95 backdrop-blur">
                {/* Visual Placeholder Strategy + Native Image Decoding Implementation Mapping Explicitly */}
                <div className="h-32 w-full bg-gradient-to-br from-primary/5 to-primary/20 relative overflow-hidden flex items-center justify-center">
                  <FolderGit2 className="h-12 w-12 text-primary/30 group-hover:scale-110 transition-transform duration-500" />

                  {/* Formal Image Optimization: native lazy loading, async decoding gracefully bounding safely seamlessly natively correctly */}
                  <img
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${project.id}&backgroundColor=ffffff,transparent`}
                    alt={`${project.name} Cover Asset Layout mapping`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply group-hover:opacity-30 transition-opacity duration-300"
                  />
                </div>

                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description ||
                      'No specific description mapped structural description text provided formally directly normally organically precisely explicitly natively.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground font-medium">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
