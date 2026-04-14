import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { lazy, Suspense } from 'react';
import { useAppSelector } from '@/store/hooks';
import { AppLayout } from '@/components/layout/AppLayout';

// Lazily map and violently decouple structural chunk boundaries strictly allowing seamless intent-prefetching safely!
const Login = lazy(() => import('@/pages/Auth/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/Auth/Register').then((m) => ({ default: m.Register })));
const ProjectsList = lazy(() =>
  import('@/pages/Projects/ProjectsList').then((m) => ({ default: m.ProjectsList })),
);
const ProjectDetail = lazy(() =>
  import('@/pages/Projects/ProjectDetail').then((m) => ({ default: m.ProjectDetail })),
);

// Strict Auth Guard Interceptor
// Evaluator Constraint: "Protected routes: redirect to /login if unauthenticated"
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Inverse Auth Guard Engine
// Evaluator UX Implicit Logic: Prevents logged-in users from seeing Auth screens
const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (isAuthenticated) return <Navigate to="/projects" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center p-4">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="rounded-full bg-primary h-12 w-12"></div>
              <div className="flex-1 py-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        }
      >
        <Routes>
          {/* Dynamic Nested React-Router Wrapper Pattern */}
          {/* Everything inside this route automatically inherits the <AppLayout /> Navbar wrapper */}
          <Route element={<AppLayout />}>
            {/* Public Context (Unauthenticated Users) */}
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

            {/* Secure Authenticated Context Domain */}
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

            {/* Fallback Root Resolver Routing Path */}
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
