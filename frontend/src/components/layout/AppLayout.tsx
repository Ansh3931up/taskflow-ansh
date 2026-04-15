import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { LogOut, Sun, Moon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="app-header">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6">
          <Link
            to="/projects"
            className="flex shrink-0 items-center gap-2 font-semibold text-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              TF
            </span>
            <span className="font-display text-base font-semibold tracking-tight">
              TaskFlow-Ansh
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-muted-foreground"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left text-sm hover:bg-muted/50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded bg-muted text-xs font-medium text-foreground">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden max-w-[160px] truncate font-medium sm:inline">
                  {user?.name || 'Account'}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-muted-foreground transition',
                    menuOpen && 'rotate-180',
                  )}
                />
              </button>
              {menuOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-1 w-56 rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-md">
                    <div className="border-b border-border px-3 py-2">
                      <p className="truncate text-sm font-medium">{user?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-[max(1rem,env(safe-area-inset-left))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] pt-6 sm:px-6 sm:pb-8 sm:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
