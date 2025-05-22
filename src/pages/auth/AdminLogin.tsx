import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';


const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { adminLogin, isAuthenticated, isAdmin, loading, error } = useAuth(); // Use adminLogin, check if error is part of context
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLogin) {
        toast.error("Admin login function is not available in AuthContext.");
        return;
    }
    const result = await adminLogin({ email, password }); // adminLogin should handle loading state internally or return it
    if (result && result.error) { // Check if adminLogin returns an error object
      toast.error(result.error.message || 'Admin login failed. Check credentials and permissions.');
    } else if (!result || (result && !result.error && !isAdmin)) { // If no error but not admin, implies login succeeded but no admin role
      // This case might need refinement based on how adminLogin and isAdmin state are precisely determined
      // For instance, adminLogin might first do a regular login, then AuthContext checks role.
      // If adminLogin itself is supposed to ensure admin role, then an error should be returned by it.
      // toast.error('Login successful, but you do not have admin privileges.');
      // navigate('/'); // Redirect non-admins away
    }
    // Successful admin login is handled by useEffect redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your administrator credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
