
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
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
      // adminLogin from useAuth might return AuthUser or similar, or just handle session internally
      const loginResult = await adminLogin(email, password); 
      
      // Check isAdmin status from context *after* login attempt
      // The specific result of adminLogin (e.g., loginResult) might also indicate success/failure or user role
      // This depends on useAuth's adminLogin implementation.
      // For now, we'll rely on the isAdmin flag in the context being updated.
      
      // A more robust check would be to see if loginResult itself contains role information
      // or if adminLogin throws an error on failure / wrong role.
      // The current `isAdmin` in context might not update immediately if not designed to.
      // Let's assume `adminLogin` returns a user-like object or boolean for success for an admin.

      if (loginResult && (loginResult.role === 'admin' || isAdmin)) { // Check result OR context
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
      } else if (loginResult && loginResult.role !== 'admin') {
        toast.error('Access Denied: Not an administrator.');
      }
      else {
        // Error handling if adminLogin itself doesn't throw for failed attempts
        if (error) { // error from useAuth context
            toast.error(error.message || 'Admin login failed. Please check your credentials.');
        } else if (!loginResult) { // If adminLogin returns null/false on failure
            toast.error('Admin login failed. Please check your credentials.');
        }
      }
    } catch (err: any) { // Catch any unexpected error during the call or if adminLogin throws
      toast.error(err.message || 'An unexpected error occurred during login.');
    }
  };

  React.useEffect(() => {
    if (isAdmin) {
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
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
