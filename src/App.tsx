
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import ScrollToTop from "./components/layout/ScrollToTop";
import CasinoMain from "./pages/casino/CasinoMain";
import LiveCasino from "./pages/casino/LiveCasino";
import Slots from "./pages/casino/Slots";
import TableGames from "./pages/casino/TableGames";
import Jackpots from "./pages/casino/Jackpots";
import NewGames from "./pages/casino/NewGames";
import Favorites from "./pages/casino/Favorites";
import Promotions from "./pages/promotions/Promotions";
import Index from "./pages/Index";
import Sports from "./pages/sports/Sports";
import Football from "./pages/sports/Football";
import Basketball from "./pages/sports/Basketball";
import Tennis from "./pages/sports/Tennis";
import Hockey from "./pages/sports/Hockey";
import Esports from "./pages/sports/Esports";
import Help from "./pages/support/Help";
import Contact from "./pages/support/Contact";
import Faq from "./pages/support/Faq";
import ResponsibleGaming from "./pages/support/ResponsibleGaming";
import VIP from "./pages/vip/VIP";
import Profile from "./pages/user/Profile";
import UserSettings from "./pages/user/Settings";
import Transactions from "./pages/user/Transactions";
import KycStatus from "./pages/kyc/KycStatus";
import NotFound from "./pages/NotFound";
import BonusHub from "./pages/bonuses/BonusHub";
import AdminLogin from "./pages/auth/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import UserProfile from "./pages/admin/UserProfile";
import Games from "./pages/admin/Games";
import GameAggregator from "./pages/admin/GameAggregator";
import AggregatorSettings from "./pages/admin/AggregatorSettings";
import CasinoAggregatorSettingsPage from "./pages/admin/CasinoAggregatorSettingsPage";
import AdminTransactions from "./pages/admin/Transactions";
import VipBonusManagement from "./pages/admin/VipBonusManagement";
import Reports from "./pages/admin/Reports";
import KycManagement from "./pages/admin/KycManagement";
import Affiliates from "./pages/admin/Affiliates";
import AdminPromotions from "./pages/admin/Promotions";
import Security from "./pages/admin/Security";
import AdminSettings from "./pages/admin/Settings";
import Logs from "./pages/admin/Logs";
import Support from "./pages/admin/Support";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Providers from "./pages/casino/Providers";
import GameDetails from "./pages/casino/GameDetails";
import Seamless from "./pages/casino/Seamless";
import GitSlotParkSeamless from "./pages/casino/GitSlotParkSeamless";
import PPIntegrationTester from "@/pages/admin/PPIntegrationTester";
import PPTransactions from "@/pages/admin/PPTransactions";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Crash from "./pages/casino/Crash";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage or default to dark
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Main App Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          {/* Casino Routes */}
          <Route path="casino">
            <Route index element={<Navigate to="/casino/main" replace />} />
            <Route path="main" element={<CasinoMain />} />
            <Route path="live" element={<LiveCasino />} />
            <Route path="slots" element={<Slots />} />
            <Route path="table-games" element={<TableGames />} />
            <Route path="jackpots" element={<Jackpots />} />
            <Route path="new" element={<NewGames />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="providers" element={<Providers />} />
            <Route path="game/:gameId" element={<GameDetails />} />
            <Route path="seamless" element={<Seamless />} />
            <Route path="gitslotpark-seamless" element={<GitSlotParkSeamless />} />
            <Route path="crash" element={<Crash />} />
          </Route>
          {/* Sports Routes */}
          <Route path="sports">
            <Route index element={<Sports />} />
            <Route path="football" element={<Football />} />
            <Route path="basketball" element={<Basketball />} />
            <Route path="tennis" element={<Tennis />} />
            <Route path="hockey" element={<Hockey />} />
            <Route path="esports" element={<Esports />} />
          </Route>
          {/* Promotions */}
          <Route path="promotions" element={<Promotions />} />
          {/* Bonus Hub */}
          <Route path="bonus-hub" element={<BonusHub />} />
          {/* VIP */}
          <Route path="vip" element={<VIP />} />
          {/* User Profile */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="kyc" element={<KycStatus />} />
          {/* Support */}
          <Route path="help" element={<Help />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="responsible-gaming" element={<ResponsibleGaming />} />
          {/* Legal */}
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          {/* Auth */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={<AdminLayout collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />}
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<UserProfile />} />
          <Route path="games" element={<Games />} />
          <Route path="game-aggregator" element={<GameAggregator />} />
          <Route path="aggregator-settings" element={<AggregatorSettings />} />
          <Route path="casino-aggregator-settings" element={<CasinoAggregatorSettingsPage />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="vip-bonus" element={<VipBonusManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="kyc" element={<KycManagement />} />
          <Route path="affiliates" element={<Affiliates />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="pp-integration-tester" element={<PPIntegrationTester />} />
          <Route path="pp-transactions" element={<PPTransactions />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="logs" element={<Logs />} />
          <Route path="support" element={<Support />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
