
import { useEffect } from "react"; // Removed useState as it's not used here
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout"; // Using Layout consistently
import AdminLayout from "./components/layout/AdminLayout";
// import ScrollToTop from "./components/layout/ScrollToTop"; // ScrollToTop logic can be in Layout/AppLayout
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
import UserProfilePage from "./pages/user/Profile"; // Renamed to avoid conflict with admin UserProfile
import UserSettings from "./pages/user/Settings";
import Transactions from "./pages/user/Transactions";
import KycStatus from "./pages/kyc/KycStatus";
import NotFound from "./pages/NotFound";
import BonusHub from "./pages/bonuses/BonusHub";
import AdminLogin from "./pages/auth/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminUserProfile from "./pages/admin/UserProfile"; // Kept for admin context
import Games from "./pages/admin/Games"; // This might be an overview page
import GamesManagement from "./pages/admin/cms/GamesManagement"; // Specific CMS game management
// import GameAggregator from "./pages/admin/GameAggregator"; // Assuming this is different from cms/GamesManagement
// import AggregatorSettings from "./pages/admin/AggregatorSettings";
// import CasinoAggregatorSettingsPage from "./pages/admin/CasinoAggregatorSettingsPage";
// import GameManagementPage from "./pages/admin/GameManagement"; // This might be redundant with cms/GamesManagement or Games
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
import GameDetails from "./pages/casino/GameDetails"; // Corrected path parameter to gameId
import Seamless from "./pages/casino/Seamless";
// import GitSlotParkSeamless from "./pages/casino/GitSlotParkSeamless";
// import PPIntegrationTester from "@/pages/admin/PPIntegrationTester";
// import PPTransactions from "@/pages/admin/PPTransactions";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Crash from "./pages/casino/Crash";
import { Toaster } from "./components/ui/sonner"; // For toasts

// ScrollToTop component for use within main Layout
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};


function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  return (
    <>
      {/* <ScrollToTop /> No longer needed here if AppLayout handles it */}
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Main App Routes using Layout (which includes AppHeader and Footer) */}
        <Route path="/" element={<Layout><ScrollToTop /></Layout>}> {/* Layout includes ScrollToTop now */}
          <Route index element={<Index />} />
          {/* Casino Routes */}
          <Route path="casino">
            <Route index element={<Navigate to="/casino/main" replace />} />
            <Route path="main" element={<CasinoMain />} />
            <Route path="live-casino" element={<LiveCasino />} />
            <Route path="slots" element={<Slots />} />
            <Route path="table-games" element={<TableGames />} />
            <Route path="jackpots" element={<Jackpots />} />
            <Route path="new" element={<NewGames />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="providers" element={<Providers />} />
            <Route path="game/:gameId" element={<GameDetails />} /> {/* gameId is the param */}
            <Route path="seamless" element={<Seamless />} />
            {/* <Route path="gitslotpark-seamless" element={<GitSlotParkSeamless />} /> */}
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
          <Route path="bonuses" element={<BonusHub />} />
          {/* VIP */}
          <Route path="vip" element={<VIP />} />
          {/* User Profile */}
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="kyc" element={<KycStatus />} />
          {/* Support */}
          <Route path="support">
            <Route path="help" element={<Help />} />
            <Route path="contact" element={<Contact />} />
            <Route path="faq" element={<Faq />} />
            <Route path="responsible-gaming" element={<ResponsibleGaming />} />
          </Route>
          {/* Legal */}
          <Route path="legal">
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
          </Route>
          {/* Auth (handled by Layout, typically no separate auth layout needed for these) */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} /> {/* Standalone login page */}
        <Route path="/admin" element={<AdminLayout />}> {/* AdminLayout wraps admin pages */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<AdminUserProfile />} />
          <Route path="games-overview" element={<Games />} /> {/* Renamed for clarity */}
          <Route path="games" element={<GamesManagement />} /> {/* Actual game management */}
          {/* <Route path="game-aggregator" element={<GameAggregator />} /> */}
          {/* <Route path="aggregator-settings" element={<AggregatorSettings />} /> */}
          {/* <Route path="casino-aggregator-settings" element={<CasinoAggregatorSettingsPage />} /> */}
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="vip-bonus" element={<VipBonusManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="kyc" element={<KycManagement />} />
          <Route path="affiliates" element={<Affiliates />} />
          <Route path="promotions" element={<AdminPromotions />} />
          {/* <Route path="pp-integration-tester" element={<PPIntegrationTester />} /> */}
          {/* <Route path="pp-transactions" element={<PPTransactions />} /> */}
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
