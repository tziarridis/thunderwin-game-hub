
// Import React and necessary hooks
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// Auth provider
import { AuthProvider } from "./contexts/AuthContext";

// Layout components
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import AppLayout from "./components/layout/AppLayout";

// Pages
import IndexPage from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/auth/AdminLogin";
import Profile from "./pages/user/Profile";
import NotFound from "./pages/NotFound";
import CasinoMain from "./pages/casino/CasinoMain";
import GameDetails from "./pages/casino/GameDetails";
import Seamless from "./pages/casino/Seamless";
import Slots from "./pages/casino/Slots";
import Sports from "./pages/sports/Sports";
import TableGames from "./pages/casino/TableGames";
import Favorites from "./pages/casino/Favorites";
import Crash from "./pages/casino/Crash";
import LiveCasino from "./pages/casino/LiveCasino";
import Jackpots from "./pages/casino/Jackpots";

// Sports pages
import Football from "./pages/sports/Football";
import Basketball from "./pages/sports/Basketball";
import Tennis from "./pages/sports/Tennis";
import Hockey from "./pages/sports/Hockey";
import Esports from "./pages/sports/Esports";

// Support pages
import Help from "./pages/support/Help";
import Faq from "./pages/support/Faq";
import Contact from "./pages/support/Contact";
import ResponsibleGaming from "./pages/support/ResponsibleGaming";

// Legal pages
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";

// Promotions & VIP
import Promotions from "./pages/promotions/Promotions";
import BonusHub from "./pages/bonuses/BonusHub";
import VIP from "./pages/vip/VIP";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import Games from "./pages/admin/Games";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import Support from "./pages/admin/Support";
import Users from "./pages/admin/Users";
import Transactions from "./pages/admin/Transactions";
import Affiliates from "./pages/admin/Affiliates";
import AdminPromotions from "./pages/admin/Promotions";
import KycManagement from "./pages/admin/KycManagement";
import Logs from "./pages/admin/Logs";
import Security from "./pages/admin/Security";
import VipBonusManagement from "./pages/admin/VipBonusManagement";
import GameAggregatorPage from "./pages/admin/GameAggregator";
import AggregatorSettings from "./pages/admin/AggregatorSettings";

// Create a client
const queryClient = new QueryClient();

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<IndexPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Casino Routes */}
            <Route path="casino" element={<CasinoMain />} />
            <Route path="casino/game/:id" element={<GameDetails />} />
            <Route path="casino/seamless" element={<Seamless />} />
            <Route path="casino/slots" element={<Slots />} />
            <Route path="casino/table-games" element={<TableGames />} />
            <Route path="casino/live-casino" element={<LiveCasino />} />
            <Route path="casino/jackpots" element={<Jackpots />} />
            <Route path="casino/providers" element={<Slots />} /> 
            <Route path="casino/favorites" element={<Favorites />} />
            <Route path="casino/crash" element={<Crash />} />
            
            {/* Sports Routes */}
            <Route path="sports" element={<Sports />} />
            <Route path="sports/football" element={<Football />} />
            <Route path="sports/basketball" element={<Basketball />} />
            <Route path="sports/tennis" element={<Tennis />} />
            <Route path="sports/hockey" element={<Hockey />} />
            <Route path="sports/esports" element={<Esports />} />
            
            {/* Promotions & Bonuses Routes */}
            <Route path="promotions" element={<Promotions />} />
            <Route path="bonuses" element={<BonusHub />} />
            <Route path="vip" element={<VIP />} />
            
            {/* Support Routes */}
            <Route path="support/help" element={<Help />} />
            <Route path="support/faq" element={<Faq />} />
            <Route path="support/contact" element={<Contact />} />
            <Route path="support/responsible-gaming" element={<ResponsibleGaming />} />
            
            {/* Legal Routes */}
            <Route path="legal/terms" element={<Terms />} />
            <Route path="legal/privacy" element={<Privacy />} />
            
            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Admin Login Route - Added here */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="games" element={<Games />} />
            <Route path="game-aggregator" element={<GameAggregatorPage />} />
            <Route path="aggregator-settings" element={<AggregatorSettings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Support />} />
            <Route path="users" element={<Users />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="affiliates" element={<Affiliates />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="kyc" element={<KycManagement />} />
            <Route path="logs" element={<Logs />} />
            <Route path="security" element={<Security />} />
            <Route path="vip-bonus" element={<VipBonusManagement />} />
          </Route>
        </Routes>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
