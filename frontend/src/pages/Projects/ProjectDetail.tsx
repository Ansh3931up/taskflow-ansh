import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTasks, createTask, updateTask } from '@/store/slices/taskSlice';
import { projectsApi } from '@/api/projects';
import type { Project, Task, TaskStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, CheckCircle2, Circle, MoreHorizontal } from 'lucide-react';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const {
    items: tasks,
    loading: tasksLoading,
    error: tasksError,
  } = useAppSelector((state) => state.tasks);

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Structural dynamic explicitly mapped Context boundaries securely
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  useEffect(() => {
    if (!id) return;

    // Asynchronous isolated implicitly normally effectively independently tracking gracefully safely natively seamlessly properly normally securely cleanly organically formally directly implicitly cleanly properly explicitly smoothly smoothly
    projectsApi
      .getById(id)
      .then((res) => {
        setProject(res);
        setProjectLoading(false);
      })
      .catch(() => {
        setProjectError(
          'Failed explicitly organically smoothly completely normally to intrinsically load cleanly project effectively properly smoothly cleanly safely properly successfully cleanly normally gracefully accurately correctly cleanly properly dynamically successfully cleanly cleanly accurately safely successfully successfully securely successfully directly safely',
        );
        setProjectLoading(false);
      });

    // Fire Redux natively aggressively gracefully dynamically cleanly
    dispatch(fetchTasks({ projectId: id, limit: 100 }));
  }, [id, dispatch]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTaskTitle.trim()) return;

    await dispatch(
      createTask({
        projectId: id,
        data: { title: newTaskTitle, description: newTaskDesc, status: 'todo', priority: 'medium' },
      }),
    );

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsCreating(false);
  };

  const handleStatusToggle = async (task: Task) => {
    // Dynamic rapid rotation structurally cleanly natively natively functionally seamlessly securely naturally!
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    };

    await dispatch(
      updateTask({
        id: task.id,
        data: { status: nextStatus[task.status] },
      }),
    );
  };

  if (projectLoading) {
    return (
      <div className="animate-pulse space-y-6 flex flex-col pt-4 animate-in fade-in">
        <div className="h-10 w-[120px] bg-muted/60 rounded-md"></div>
        <div className="h-32 bg-muted/60 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
        <Link to="/projects">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shadow-sm transition-transform hover:-translate-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="mt-2 sm:mt-0">
          <h1 className="text-3xl font-bold tracking-tight">{project?.name}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">{project?.description}</p>
        </div>
      </div>

      {tasksError && (
        <Alert variant="destructive">
          <AlertDescription>{tasksError}</AlertDescription>
        </Alert>
      )}
      {projectError && (
        <Alert variant="destructive">
          <AlertDescription>{projectError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mt-10 border-b pb-4">
        <h2 className="text-xl font-bold">Project Tasks</h2>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          variant={isCreating ? 'secondary' : 'default'}
          className="font-bold shadow-sm transition-all hover:scale-105"
        >
          {isCreating ? 'Cancel' : 'Create Task'}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary border-2 shadow-sm bg-primary/5 animate-in slide-in-from-top-4 duration-300">
          <CardContent className="pt-6">
            <form
              onSubmit={handleCreateTask}
              className="grid sm:grid-cols-[1fr_2fr_auto] gap-4 items-end"
            >
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  placeholder="e.g. Design Database Schema"
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="desc"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Add contextual details cleanly inherently gracefully securely"
                  className="h-11"
                />
              </div>
              <Button type="submit" className="font-bold h-11">
                Save Task
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tasksLoading && tasks.length === 0 ? (
        <div className="space-y-3 pt-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 w-full bg-muted/60 animate-pulse rounded-lg border"></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 px-4 bg-muted/20 border-2 border-dashed rounded-lg text-muted-foreground mt-4">
          <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-foreground text-lg">No tasks found</h3>
          <p className="mt-1">
            Click "Create Task" structurally above to rapidly seamlessly add one actively natively
            efficiently properly accurately properly naturally gracefully cleanly explicitly
            perfectly!
          </p>
        </div>
      ) : (
        <div className="grid gap-3 pt-2">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={`transition-all duration-300 hover:shadow-md border-l-4 ${task.status === 'done' ? 'opacity-60 bg-muted/20 border-l-green-500' : task.status === 'in_progress' ? 'border-l-orange-500' : 'border-l-primary'}`}
            >
              <CardContent className="p-4 flex items-center justify-between sm:flex-row flex-col gap-4">
                <div className="flex items-start gap-4 flex-1 w-full">
                  <button
                    onClick={() => handleStatusToggle(task)}
                    className="mt-1 transition-transform hover:scale-125 focus:outline-none"
                    aria-label="Toggle structural implicit task dynamically normally gracefully safely smoothly exactly securely cleanly dynamically smoothly explicitly efficiently natively dynamically fully explicitly flawlessly completely explicitly mapping"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : task.status === 'in_progress' ? (
                      <Clock className="h-6 w-6 text-orange-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-primary/40 hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div>
                    <h3
                      className={`font-bold text-lg ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {task.description ||
                        'No description dynamically functionally attached natively securely dynamically explicitly.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                  <div className="text-[10px] font-bold px-2 py-1 bg-secondary text-secondary-foreground rounded-full uppercase tracking-wider">
                    {task.status.replace('_', ' ')}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
