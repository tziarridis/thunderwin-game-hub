
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";

// Main Pages
import IndexPage from "./pages/Index";
import NotFoundPage from "./pages/NotFound";

// Auth Pages
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import AdminLoginPage from "./pages/auth/AdminLogin";

// Casino Pages
import CasinoMain from "./pages/casino/CasinoMain";
import TableGames from "./pages/casino/TableGames";
import SlotGames from "./pages/casino/Slots";
import LiveCasino from "./pages/casino/LiveCasino";
import GameDetails from "./pages/casino/GameDetails";
import Jackpots from "./pages/casino/Jackpots";
import Providers from "./pages/casino/Providers";

// Sports Pages
import SportsMain from "./pages/sports/Sports";
import Football from "./pages/sports/Football";
import Basketball from "./pages/sports/Basketball";
import Tennis from "./pages/sports/Tennis";
import Hockey from "./pages/sports/Hockey";
import Esports from "./pages/sports/Esports";

// Promotions
import PromotionsPage from "./pages/promotions/Promotions";

// VIP and Bonuses
import VIPPage from "./pages/vip/VIP";
import BonusHub from "./pages/bonuses/BonusHub";

// KYC Pages
import KycForm from "./components/kyc/KycForm";
import KycStatus from "./pages/kyc/KycStatus";

// User Pages
import UserProfile from "./pages/user/Profile";
import UserSettings from "./pages/user/Settings";
import UserTransactions from "./pages/user/Transactions";

// Support Pages
import Help from "./pages/support/Help";
import FAQ from "./pages/support/Faq";
import Contact from "./pages/support/Contact";
import ResponsibleGaming from "./pages/support/ResponsibleGaming";

// Legal Pages
import TermsPage from "./pages/legal/Terms";
import PrivacyPage from "./pages/legal/Privacy";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminTransactions from "./pages/admin/Transactions";
import AdminReports from "./pages/admin/Reports";
import AdminGames from "./pages/admin/Games";
import AdminPromotions from "./pages/admin/Promotions";
import AdminAffiliates from "./pages/admin/Affiliates";
import AdminSupport from "./pages/admin/Support";
import AdminLogs from "./pages/admin/Logs";
import AdminSecurity from "./pages/admin/Security";
import AdminSettings from "./pages/admin/Settings";
import KycManagement from "./pages/admin/KycManagement";
import VipBonusManagement from "./pages/admin/VipBonusManagement";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          
          {/* Auth routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="admin-login" element={<AdminLoginPage />} />
          
          {/* Casino routes */}
          <Route path="casino" element={<CasinoMain />} />
          <Route path="casino/table-games" element={<TableGames />} />
          <Route path="casino/slots" element={<SlotGames />} />
          <Route path="casino/live-casino" element={<LiveCasino />} />
          <Route path="casino/game/:id" element={<GameDetails />} />
          <Route path="casino/jackpots" element={<Jackpots />} />
          <Route path="casino/providers" element={<Providers />} />
          
          {/* Sports routes */}
          <Route path="sports" element={<SportsMain />} />
          <Route path="sports/football" element={<Football />} />
          <Route path="sports/basketball" element={<Basketball />} />
          <Route path="sports/tennis" element={<Tennis />} />
          <Route path="sports/hockey" element={<Hockey />} />
          <Route path="sports/esports" element={<Esports />} />
          
          {/* Promotions */}
          <Route path="promotions" element={<PromotionsPage />} />
          
          {/* VIP and Bonuses */}
          <Route path="vip" element={<VIPPage />} />
          <Route path="bonuses" element={<BonusHub />} />
          
          {/* KYC */}
          <Route path="kyc" element={<KycForm />} />
          <Route path="kyc/status" element={<KycStatus />} />
          
          {/* User account */}
          <Route path="profile" element={<UserProfile />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="transactions" element={<UserTransactions />} />
          
          {/* Support */}
          <Route path="help" element={<Help />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<Contact />} />
          <Route path="responsible-gaming" element={<ResponsibleGaming />} />
          
          {/* Legal */}
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/games" element={<AdminGames />} />
        <Route path="/admin/promotions" element={<AdminPromotions />} />
        <Route path="/admin/affiliates" element={<AdminAffiliates />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
        <Route path="/admin/security" element={<AdminSecurity />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/kyc" element={<KycManagement />} />
        <Route path="/admin/vip-bonus" element={<VipBonusManagement />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
