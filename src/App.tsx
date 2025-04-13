
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

// Pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/user/Profile";
import NotFound from "./pages/NotFound";
import CasinoMain from "./pages/casino/CasinoMain";
import GameDetails from "./pages/casino/GameDetails";
import Seamless from "./pages/casino/Seamless";
import Slots from "./pages/casino/Slots";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import Games from "./pages/admin/Games";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import Support from "./pages/admin/Support";
import Users from "./pages/admin/Users";
import Transactions from "./pages/admin/Transactions";
import Affiliates from "./pages/admin/Affiliates";
import Promotions from "./pages/admin/Promotions";
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
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={<Profile />} />
            <Route path="casino" element={<CasinoMain />} />
            <Route path="casino/game/:id" element={<GameDetails />} />
            <Route path="casino/seamless" element={<Seamless />} />
            <Route path="casino/slots" element={<Slots />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          
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
            <Route path="promotions" element={<Promotions />} />
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
