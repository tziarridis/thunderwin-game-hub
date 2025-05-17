
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; // Assuming sonner is used for toasts
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin, loading, error, isAdmin } = useAuth(); // Removed session
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLogin) {
      toast.error("Admin login functionality is not available.");
      return;
    }
    try {
      const loggedInUser = await adminLogin(email, password);
      if (loggedInUser) {
        // Check if the user is actually an admin based on role from AuthUser
        if (loggedInUser.role === 'admin') {
          toast.success('Admin login successful!');
          navigate('/admin/dashboard');
        } else {
          // Log out user if not an admin but login somehow succeeded through adminLogin
          // This case should ideally be handled by the adminLogin logic itself
          toast.error('Access Denied: Not an administrator.');
          // await logout(); // if logout is available and needed
        }
      } else {
        // Error is handled by useAuth hook and displayed or via toast
        // toast.error(error?.message || 'Admin login failed. Please check your credentials.');
        // The error state from useAuth might have more specific info
        if(error) {
            toast.error(error.message || 'Admin login failed. Please check your credentials.');
        } else {
            toast.error('Admin login failed. Please check your credentials.');
        }
      }
    } catch (err: any) { // Catch any unexpected error during the call
      toast.error(err.message || 'An unexpected error occurred during login.');
    }
  };

  // Redirect if already logged in as admin
  React.useEffect(() => {
    if (isAdmin) { // Directly use isAdmin boolean
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">Access the administration panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-transparent"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
            {/* error state from useAuth might be displayed here if needed */}
            {/* {error && <p className="text-sm text-red-500">{error.message}</p>} */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
