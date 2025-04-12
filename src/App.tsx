import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";

// Regular pages
import IndexPage from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import AdminLogin from "@/pages/auth/AdminLogin";
import PlaceholderPage from "@/components/PlaceholderPage";

// Casino pages
import CasinoMain from "@/pages/casino/CasinoMain";
import Slots from "@/pages/casino/Slots";
import TableGames from "@/pages/casino/TableGames";
import LiveCasino from "@/pages/casino/LiveCasino";
import Jackpots from "@/pages/casino/Jackpots";
import Providers from "@/pages/casino/Providers";
import GameDetails from "@/pages/casino/GameDetails";

// Sports pages
import Sports from "@/pages/sports/Sports";
import Football from "@/pages/sports/Football";
import Basketball from "@/pages/sports/Basketball";
import Tennis from "@/pages/sports/Tennis";
import Hockey from "@/pages/sports/Hockey";
import Esports from "@/pages/sports/Esports";

// Admin pages
import Dashboard from "@/pages/admin/Dashboard";
import Users from "@/pages/admin/Users";
import Games from "@/pages/admin/Games";
import Transactions from "@/pages/admin/Transactions";
import Logs from "@/pages/admin/Logs";
import Promotions from "@/pages/admin/Promotions";
import Support from "@/pages/admin/Support";
import Affiliates from "@/pages/admin/Affiliates";
import Settings from "@/pages/admin/Settings";
import Reports from "@/pages/admin/Reports";
import Security from "@/pages/admin/Security";
import KycManagement from "@/pages/admin/KycManagement";
import VipBonusManagement from "@/pages/admin/VipBonusManagement";

// User pages
import UserSettings from "@/pages/user/Settings";
import Profile from "@/pages/user/Profile";
import UserTransactions from "@/pages/user/Transactions";

// Support pages
import Faq from "@/pages/support/Faq";
import Contact from "@/pages/support/Contact";
import Help from "@/pages/support/Help";
import ResponsibleGaming from "@/pages/support/ResponsibleGaming";

// Other pages
import VIPPage from "@/pages/vip/VIP";
import Promotions as PromotionsPage from "@/pages/promotions/Promotions";
import BonusHub from "@/pages/bonuses/BonusHub";
import Terms from "@/pages/legal/Terms";
import Privacy from "@/pages/legal/Privacy";

// KYC pages
import KycForm from "@/components/kyc/KycForm";
import KycStatus from "@/pages/kyc/KycStatus";

function App() {
  return (
    <>
      <Routes>
        {/* Layout pages */}
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          
          {/* Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Casino Routes */}
          <Route path="casino" element={<CasinoMain />} />
          <Route path="casino/slots" element={<Slots />} />
          <Route path="casino/table-games" element={<TableGames />} />
          <Route path="casino/live-casino" element={<LiveCasino />} />
          <Route path="casino/jackpots" element={<Jackpots />} />
          <Route path="casino/providers" element={<Providers />} />
          <Route path="casino/games/:id" element={<GameDetails />} />
          
          {/* Sports Routes */}
          <Route path="sports" element={<Sports />} />
          <Route path="sports/football" element={<Football />} />
          <Route path="sports/basketball" element={<Basketball />} />
          <Route path="sports/tennis" element={<Tennis />} />
          <Route path="sports/hockey" element={<Hockey />} />
          <Route path="sports/esports" element={<Esports />} />
          
          {/* User Routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="transactions" element={<UserTransactions />} />
          
          {/* Support Routes */}
          <Route path="faq" element={<Faq />} />
          <Route path="contact" element={<Contact />} />
          <Route path="help" element={<Help />} />
          <Route path="responsible-gaming" element={<ResponsibleGaming />} />
          
          {/* Other Routes */}
          <Route path="vip" element={<VIPPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="bonuses" element={<BonusHub />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          
          {/* KYC Routes */}
          <Route path="kyc" element={<KycForm />} />
          <Route path="kyc/status" element={<KycStatus />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="login" element={<AdminLogin />} />
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="games" element={<Games />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="logs" element={<Logs />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="support" element={<Support />} />
          <Route path="affiliates" element={<Affiliates />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="security" element={<Security />} />
          <Route path="kyc" element={<KycManagement />} />
          <Route path="vip-bonus" element={<VipBonusManagement />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
