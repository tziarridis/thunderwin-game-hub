
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
import Reports from "./pages/admin/Reports";
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

// Import new and existing pages
import CasinoMain from "./pages/casino/CasinoMain";
import SlotsPage from "./pages/casino/Slots";
import LiveCasinoPage from "./pages/casino/LiveCasino";
import TableGamesPage from "./pages/casino/TableGames";
import JackpotsPage from "./pages/casino/Jackpots";
import ProvidersPage from "./pages/casino/Providers";
import FootballPage from "./pages/sports/Football";
import BasketballPage from "./pages/sports/Basketball";
import TennisPage from "./pages/sports/Tennis";
import HockeyPage from "./pages/sports/Hockey";
import EsportsPage from "./pages/sports/Esports";
import HelpCenterPage from "./pages/support/Help";
import HelpCenterFaqPage from "./pages/support/Faq";
import ResponsibleGamingPage from "./pages/support/ResponsibleGaming";
import TermsPage from "./pages/legal/Terms";
import PrivacyPage from "./pages/legal/Privacy";
import ContactPage from "./pages/support/Contact";

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
                
                {/* Casino Routes */}
                <Route path="/casino" element={<CasinoMain />} />
                <Route path="/casino/slots" element={<SlotsPage />} />
                <Route path="/casino/live" element={<LiveCasinoPage />} />
                <Route path="/casino/table-games" element={<TableGamesPage />} />
                <Route path="/casino/jackpots" element={<JackpotsPage />} />
                <Route path="/casino/providers" element={<ProvidersPage />} />
                <Route path="/casino/game/:id" element={<GameDetails />} />
                
                {/* Sports Routes */}
                <Route path="/sports" element={<Sports />} />
                <Route path="/sports/football" element={<FootballPage />} />
                <Route path="/sports/basketball" element={<BasketballPage />} />
                <Route path="/sports/tennis" element={<TennisPage />} />
                <Route path="/sports/hockey" element={<HockeyPage />} />
                <Route path="/sports/esports" element={<EsportsPage />} />
                
                {/* Other Main Routes */}
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/vip" element={<VIP />} />
                
                {/* Support Routes */}
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/faq" element={<HelpCenterFaqPage />} />
                <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                
                {/* Legal Routes */}
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                
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
                <Route path="reports" element={<Reports />} />
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
