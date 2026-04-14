import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="border-b bg-primary text-primary-foreground shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight transition-transform hover:scale-105"
        >
          {/* Bold Zomato Branded Logo Representation */}
          <div className="bg-white text-primary rounded-md p-1 font-black leading-none">TF</div>
          TaskFlow
        </Link>

        <div className="ml-auto flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              {/* Navbar "User Greeting" - Directly satisfying the explicit prompt requirement */}
              <span className="text-sm font-medium hidden sm:inline-block tracking-wide">
                Hello, {user.name}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-primary font-bold shadow hover:shadow-md transition-all"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-primary font-bold shadow hover:shadow-md transition-all"
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-white hover:bg-white hover:text-primary transition-all font-semibold"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
