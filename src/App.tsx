
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminGames from "./pages/admin/Games";
import AdminTransactions from "./pages/admin/Transactions";
import AdminPromotions from "./pages/admin/Promotions";
import AdminSupport from "./pages/admin/Support";
import AdminSecurity from "./pages/admin/Security";
import AdminSettings from "./pages/admin/Settings";
import Logs from "./pages/admin/Logs";
import Affiliates from "./pages/admin/Affiliates";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import GameDetails from "./pages/casino/GameDetails";
import Profile from "./pages/user/Profile";
import Transactions from "./pages/user/Transactions";
import Settings from "./pages/user/Settings";
import Sports from "./pages/sports/Sports";
import Promotions from "./pages/promotions/Promotions";
import VIP from "./pages/vip/VIP";
import { useEffect } from "react";
import { usersApi, gamesApi, transactionsApi } from "./services/apiService";
import { initializeDatabaseOnStartup } from "./utils/dbInitializer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
});

// Protected route component to ensure only admins can access admin pages
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Initialize database and API data on app startup
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize database first
        initializeDatabaseOnStartup();
        
        // Preload API data 
        await Promise.all([
          usersApi.getUsers(),
          gamesApi.getGames(),
          transactionsApi.getTransactions()
        ]);
        console.log("API data initialized successfully");
      } catch (error) {
        console.error("Failed to initialize API data:", error);
      }
    };
    
    initializeData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/casino" element={<Index />} />
                <Route path="/casino/game/:id" element={<GameDetails />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/vip" element={<VIP />} />
                
                {/* User routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="games" element={<AdminGames />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="reports" element={<AdminDashboard />} />
                <Route path="affiliates" element={<Affiliates />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="logs" element={<Logs />} />
                <Route path="security" element={<AdminSecurity />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
