
import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ScrollToTop from "./components/layout/ScrollToTop";
import Index from "./pages/Index";
import CasinoMain from "./pages/casino/CasinoMain";
import SlotGames from "./pages/casino/Slots";
import TableGames from "./pages/casino/TableGames";
import LiveCasino from "./pages/casino/LiveCasino";
import Jackpots from "./pages/casino/Jackpots";
import Providers from "./pages/casino/Providers";
import GameDetails from "./pages/casino/GameDetails";
import CrashGamesPage from "./pages/casino/Crash";
import NewGamesPage from "./pages/casino/NewGames";
import FavoritesPage from "./pages/casino/Favorites";
import Sports from "./pages/sports/Sports";
import Football from "./pages/sports/Football";
import Basketball from "./pages/sports/Basketball";
import Tennis from "./pages/sports/Tennis";
import Hockey from "./pages/sports/Hockey";
import Esports from "./pages/sports/Esports";
import Promotions from "./pages/promotions/Promotions";
import VIP from "./pages/vip/VIP";
import BonusHub from "./pages/bonuses/BonusHub";
import Profile from "./pages/user/Profile";
import Transactions from "./pages/user/Transactions";
import Settings from "./pages/user/Settings";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminGames from "./pages/admin/Games";
import AdminTransactions from "./pages/admin/Transactions";
import AdminReports from "./pages/admin/Reports";
import AdminPromotions from "./pages/admin/Promotions";
import AdminLogs from "./pages/admin/Logs";
import AdminSettings from "./pages/admin/Settings";
import AdminSecurity from "./pages/admin/Security";
import AdminSupport from "./pages/admin/Support";
import AdminKycManagement from "./pages/admin/KycManagement";
import AdminVipBonusManagement from "./pages/admin/VipBonusManagement";
import AdminAffiliates from "./pages/admin/Affiliates";
import Contact from "./pages/support/Contact";
import Help from "./pages/support/Help";
import Faq from "./pages/support/Faq";
import ResponsibleGaming from "./pages/support/ResponsibleGaming";
import KycStatus from "./pages/kyc/KycStatus";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import SupportChat from "./components/support/SupportChat";
import "./App.css";

function App() {
  return (
    <>
      {/* Add ScrollToTop component to ensure all page changes start at the top */}
      <ScrollToTop />
      
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Index />} />
          
          {/* Casino Routes */}
          <Route path="casino" element={<CasinoMain />} />
          <Route path="casino/slots" element={<SlotGames />} />
          <Route path="casino/table-games" element={<TableGames />} />
          <Route path="casino/live-casino" element={<LiveCasino />} />
          <Route path="casino/jackpots" element={<Jackpots />} />
          <Route path="casino/providers" element={<Providers />} />
          <Route path="casino/game/:id" element={<GameDetails />} />
          <Route path="casino/crash" element={<CrashGamesPage />} />
          <Route path="casino/new" element={<NewGamesPage />} />
          <Route path="casino/favorites" element={<FavoritesPage />} />
          
          {/* Sports Routes */}
          <Route path="sports" element={<Sports />} />
          <Route path="sports/football" element={<Football />} />
          <Route path="sports/basketball" element={<Basketball />} />
          <Route path="sports/tennis" element={<Tennis />} />
          <Route path="sports/hockey" element={<Hockey />} />
          <Route path="sports/esports" element={<Esports />} />
          
          {/* Other Main Routes */}
          <Route path="promotions" element={<Promotions />} />
          <Route path="vip" element={<VIP />} />
          <Route path="bonuses" element={<BonusHub />} />
          
          {/* User Routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Support Routes */}
          <Route path="support/contact" element={<Contact />} />
          <Route path="support/help" element={<Help />} />
          <Route path="support/faq" element={<Faq />} />
          <Route path="support/responsible-gaming" element={<ResponsibleGaming />} />
          
          {/* KYC Routes */}
          <Route path="kyc/status" element={<KycStatus />} />
          
          {/* Legal Routes */}
          <Route path="legal/privacy" element={<Privacy />} />
          <Route path="legal/terms" element={<Terms />} />
        </Route>
        
        {/* Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="admin/login" element={<AdminLogin />} />
        
        {/* Admin Routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="games" element={<AdminGames />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="kyc" element={<AdminKycManagement />} />
          <Route path="vip-management" element={<AdminVipBonusManagement />} />
          <Route path="affiliates" element={<AdminAffiliates />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Global Support Chat */}
      <SupportChat />
    </>
  );
}

export default App;
