
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import { LoginCredentials } from '@/types';

const AdminLoginPage: React.FC = () => {
  const { adminLogin, isLoading, error: authError, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    if (!adminLogin) {
        toast.error("Admin login functionality is not available.");
        return;
    }
    
    const credentials: LoginCredentials = { email, password };
    const result = await adminLogin(credentials);

    if (result && !result.error) {
      toast.success('Admin login successful!');
      navigate('/admin/dashboard'); 
    } else if (result && result.error) {
      toast.error(result.error.message || 'Admin login failed. Check credentials or permissions.');
    } else if (!result) {
        toast.error('Admin login failed. An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-gray-800 border-gray-700 text-white">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          <CardTitle className="text-3xl font-bold">Admin Panel</CardTitle>
          <CardDescription className="text-gray-400">Secure sign-in for administrators.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base bg-gray-700 border-gray-600 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base bg-gray-700 border-gray-600 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {authError && <p className="text-sm text-red-400 text-center">{authError}</p>}
            <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
              Sign In as Admin
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          {/* Optional: Link back to main site or other info */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
