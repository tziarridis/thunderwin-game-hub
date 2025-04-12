
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";

// Layout components
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/auth/AdminLogin";

// User pages
import Profile from "./pages/user/Profile";
import UserSettings from "./pages/user/Settings";
import UserTransactions from "./pages/user/Transactions";

// Casino pages
import CasinoMain from "./pages/casino/CasinoMain";
import GameDetails from "./pages/casino/GameDetails";
import Slots from "./pages/casino/Slots";
import LiveCasino from "./pages/casino/LiveCasino";
import TableGames from "./pages/casino/TableGames";
import Jackpots from "./pages/casino/Jackpots";
import Providers from "./pages/casino/Providers";

// Sports pages
import Sports from "./pages/sports/Sports";
import Football from "./pages/sports/Football";
import Basketball from "./pages/sports/Basketball";
import Tennis from "./pages/sports/Tennis";
import Hockey from "./pages/sports/Hockey";
import Esports from "./pages/sports/Esports";

// Promotions and VIP
import Promotions from "./pages/promotions/Promotions";
import BonusHub from "./pages/bonuses/BonusHub";
import VIP from "./pages/vip/VIP";

// Support pages
import Help from "./pages/support/Help";
import FAQ from "./pages/support/Faq";
import Contact from "./pages/support/Contact";
import ResponsibleGaming from "./pages/support/ResponsibleGaming";

// Legal pages
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminGames from "./pages/admin/Games";
import AdminTransactions from "./pages/admin/Transactions";
import AdminLogs from "./pages/admin/Logs";
import AdminAffiliates from "./pages/admin/Affiliates";
import AdminSettings from "./pages/admin/Settings";
import AdminReports from "./pages/admin/Reports";
import AdminSecurity from "./pages/admin/Security";
import AdminPromotions from "./pages/admin/Promotions";
import AdminSupport from "./pages/admin/Support";
import VipBonusManagement from "./pages/admin/VipBonusManagement";
import KycManagement from "./pages/admin/KycManagement";

// KYC pages
import KycForm from "./components/kyc/KycForm";
import KycStatus from "./pages/kyc/KycStatus";

// Initialize QueryClient for react-query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Main site routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              
              {/* Auth routes */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              
              {/* User account routes */}
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<UserSettings />} />
              <Route path="transactions" element={<UserTransactions />} />
              
              {/* Casino routes */}
              <Route path="casino" element={<CasinoMain />} />
              <Route path="casino/game/:id" element={<GameDetails />} />
              <Route path="casino/slots" element={<Slots />} />
              <Route path="casino/live" element={<LiveCasino />} />
              <Route path="casino/table" element={<TableGames />} />
              <Route path="casino/jackpots" element={<Jackpots />} />
              <Route path="casino/providers" element={<Providers />} />
              
              {/* Sports routes */}
              <Route path="sports" element={<Sports />} />
              <Route path="sports/football" element={<Football />} />
              <Route path="sports/basketball" element={<Basketball />} />
              <Route path="sports/tennis" element={<Tennis />} />
              <Route path="sports/hockey" element={<Hockey />} />
              <Route path="sports/esports" element={<Esports />} />
              
              {/* Promotions and VIP */}
              <Route path="promotions" element={<Promotions />} />
              <Route path="bonuses" element={<BonusHub />} />
              <Route path="vip" element={<VIP />} />
              
              {/* KYC routes */}
              <Route path="kyc" element={<KycForm />} />
              <Route path="kyc/status" element={<KycStatus />} />
              
              {/* Support routes */}
              <Route path="help" element={<Help />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="responsible-gaming" element={<ResponsibleGaming />} />
              
              {/* Legal routes */}
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
            </Route>
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="games" element={<AdminGames />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="affiliates" element={<AdminAffiliates />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="vip-bonus" element={<VipBonusManagement />} />
              <Route path="kyc" element={<KycManagement />} />
            </Route>
            
            {/* 404 and redirects */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
