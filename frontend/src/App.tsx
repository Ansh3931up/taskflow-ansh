import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthCardSkeleton } from '@/components/auth/AuthCardSkeleton';

const Login = lazy(() => import('@/pages/Auth/Login'));
const Register = lazy(() => import('@/pages/Auth/Register'));
const ProjectsList = lazy(() =>
  import('@/pages/Projects/ProjectsList').then((m) => ({ default: m.ProjectsList })),
);
const ProjectDetail = lazy(() => import('@/pages/Projects/ProjectDetail'));

function SuspenseFallback() {
  const { pathname } = useLocation();
  if (pathname === '/login' || pathname === '/register') {
    return <AuthCardSkeleton />;
  }
  return <PageSkeleton />;
}

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <Skeleton className="h-5 w-72" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-lg border overflow-hidden">
            <Skeleton className="h-32 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (isAuthenticated) return <Navigate to="/projects" replace />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />

            <Route element={<AppLayout />}>
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="*" element={<Navigate to="/projects" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
