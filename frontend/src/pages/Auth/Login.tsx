import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Directly bind UI components natively against Thunk Redux mapping payloads safely
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError()); // Clear legacy visual artifacts organically securely explicitly

    // Asynchronous dispatch perfectly interacting structurally avoiding state races safely
    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      navigate('/projects');
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-sm">
            Enter your email below to seamlessly login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              disabled={loading}
              type="submit"
              className="w-full font-bold h-11 text-base shadow-md"
            >
              {loading ? 'Logging in securely...' : 'Login to TaskFlow'}
            </Button>

            <div className="text-center text-sm font-medium mt-2 text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                // Advanced Prefetch Implementation mapping physically structurally avoiding UI latency cleanly
                onMouseEnter={() => import('@/pages/Auth/Register')}
                className="text-primary hover:underline transition-all"
              >
                Sign up securely
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
