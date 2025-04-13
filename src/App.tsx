// Import React and necessary hooks
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// Auth provider
import { AuthProvider } from "./contexts/AuthContext";

// Layout components
import Layout from "./components/layout/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CasinoMain from "./pages/casino/CasinoMain";
import GameDetails from "./pages/casino/GameDetails";
import Seamless from "./pages/casino/Seamless";

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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={<Profile />} />
            <Route path="casino" element={<CasinoMain />} />
            <Route path="casino/game/:id" element={<GameDetails />} />
            <Route path="casino/seamless" element={<Seamless />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/games" element={<Games />} />
          <Route path="/admin/game-aggregator" element={<GameAggregatorPage />} />
          <Route path="/admin/aggregator-settings" element={<AggregatorSettings />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/support" element={<Support />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/transactions" element={<Transactions />} />
          <Route path="/admin/affiliates" element={<Affiliates />} />
          <Route path="/admin/promotions" element={<Promotions />} />
          <Route path="/admin/kyc" element={<KycManagement />} />
          <Route path="/admin/logs" element={<Logs />} />
          <Route path="/admin/security" element={<Security />} />
          <Route path="/admin/vip-bonus" element={<VipBonusManagement />} />
        </Routes>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
