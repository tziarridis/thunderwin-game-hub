
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';

interface AdminAuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export function AdminAuthGuard({ 
  children, 
  requiredRole, 
  fallback 
}: AdminAuthGuardProps) {
  const { user, isAdmin, hasRole, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return fallback || <Navigate to="/auth/admin-login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have the required permissions to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
