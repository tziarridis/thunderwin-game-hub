
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, LogIn } from 'lucide-react';
import { LoginCredentials } from '@/types'; // Import LoginCredentials

const LoginPage: React.FC = () => {
  const { login, loading, error: authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirect if already logged in
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    
    const credentials: LoginCredentials = { email, password };
    const result = await login(credentials);

    if (result && !result.error) {
      toast.success('Logged in successfully!');
      navigate('/'); // Redirect to dashboard or home on successful login
    } else if (result && result.error) {
      // AuthError's message is already handled by AuthContext's setError,
      // but we can show a toast here too.
      toast.error(result.error.message || 'Login failed. Please check your credentials.');
    } else if (!result) { // Should not happen if login always returns object
        toast.error('Login failed. An unexpected error occurred.');
    }
  };
  
  // Display authError from context if it exists
  React.useEffect(() => {
    if (authError) {
      // toast.error(authError); // AuthContext might already show its own errors via a global Toaster
      // Clear error in context after showing? Or let context manage its display.
    }
  }, [authError]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-casino-dark to-casino-darker p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your account and continue the thrill.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            {authError && <p className="text-sm text-red-500 text-center">{authError}</p>}
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
           <Link to="/forgot-password" // Assuming a forgot password route
            className="text-sm text-primary hover:underline"
          >
            Forgot your password?
          </Link>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
