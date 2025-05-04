
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Session } from '@supabase/supabase-js';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Games from '@/pages/Games';
import Transactions from '@/pages/Transactions';
import { AuthContext } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import Users from '@/pages/admin/Users';
import GamesAdmin from '@/pages/admin/GamesAdmin';
import ReportsPage from '@/pages/admin/Reports';
import Promotions from '@/pages/promotions/Promotions';
import BonusHub from '@/pages/bonuses/BonusHub';
import { AdminProtected } from '@/components/auth/AdminProtected';
import BonusManagement from '@/pages/admin/BonusManagement';
import AnalyticsDashboard from '@/pages/admin/AnalyticsDashboard';

const App = () => {
  const session: Session | null = useSession();
  const supabase = useSupabaseClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setIsAuthenticated(!!session);
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.is_admin || false);
        }
        setUser(session.user);
      } else {
        setIsAdmin(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [session, supabase]);

  // TypeScript fix - explicitly pass user to avoid type errors
  const authContextValue = { 
    isAuthenticated, 
    isAdmin, 
    isLoading, 
    user 
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <>{children}</>;
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="bg-white p-8 rounded shadow-md w-96">
                  <h2 className="text-2xl font-semibold mb-4">Login</h2>
                  <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'github']}
                  />
                </div>
              </div>
            }
          />
          
          <Route
            path="/register"
            element={
              <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="bg-white p-8 rounded shadow-md w-96">
                  <h2 className="text-2xl font-semibold mb-4">Register</h2>
                  <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'github']}
                    redirectTo="http://localhost:3000/profile"
                  />
                </div>
              </div>
            }
          />

          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Layout>
                  <Games />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/promotions"
            element={
              <Layout>
                <Promotions />
              </Layout>
            }
          />

          <Route
            path="/bonuses"
            element={
              <ProtectedRoute>
                <Layout>
                  <BonusHub />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtected>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminProtected>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtected>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </AdminProtected>
            }
          />
          <Route
            path="/admin/games"
            element={
              <AdminProtected>
                <AdminLayout>
                  <GamesAdmin />
                </AdminLayout>
              </AdminProtected>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminProtected>
                <AdminLayout>
                  <ReportsPage />
                </AdminLayout>
              </AdminProtected>
            }
          />
          <Route 
            path="/admin/bonus-management" 
            element={
              <AdminProtected>
                <AdminLayout>
                  <BonusManagement />
                </AdminLayout>
              </AdminProtected>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <AdminProtected>
                <AdminLayout>
                  <AnalyticsDashboard />
                </AdminLayout>
              </AdminProtected>
            } 
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
