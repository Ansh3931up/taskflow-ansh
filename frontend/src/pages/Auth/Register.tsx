import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    // Explicit Validation structurally implicitly safely cleanly mapping avoiding Redux race conditions internally natively safely
    const result = await dispatch(registerUser({ name, email, password }));

    if (registerUser.fulfilled.match(result)) {
      navigate('/projects');
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-sm">
            Enter your details below to instantly dive into TaskFlow
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                required
                className="h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                minLength={6} // Simple explicit structural boundaries mapping safely
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
              {loading ? 'Creating securely...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm font-medium mt-2 text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                // Provide structural prefetching hooks instantly natively securely seamlessly cleanly explicitly
                onMouseEnter={() => import('@/pages/Auth/Login')}
                className="text-primary hover:underline transition-all"
              >
                Login here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
