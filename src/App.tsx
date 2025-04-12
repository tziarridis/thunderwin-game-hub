
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <Layout>
              <IndexPage />
            </Layout>
          } />
          
          {/* Auth routes */}
          <Route path="login" element={
            <Layout>
              <LoginPage />
            </Layout>
          } />
          <Route path="register" element={
            <Layout>
              <RegisterPage />
            </Layout>
          } />
          <Route path="admin-login" element={
            <Layout>
              <AdminLoginPage />
            </Layout>
          } />
          
          {/* Casino routes */}
          <Route path="casino" element={
            <Layout>
              <CasinoMain />
            </Layout>
          } />
          <Route path="casino/table-games" element={
            <Layout>
              <TableGames />
            </Layout>
          } />
          <Route path="casino/slots" element={
            <Layout>
              <SlotGames />
            </Layout>
          } />
          <Route path="casino/live-casino" element={
            <Layout>
              <LiveCasino />
            </Layout>
          } />
          <Route path="casino/game/:id" element={
            <Layout>
              <GameDetails />
            </Layout>
          } />
          <Route path="casino/jackpots" element={
            <Layout>
              <Jackpots />
            </Layout>
          } />
          <Route path="casino/providers" element={
            <Layout>
              <Providers />
            </Layout>
          } />
          
          {/* Sports routes */}
          <Route path="sports" element={
            <Layout>
              <SportsMain />
            </Layout>
          } />
          <Route path="sports/football" element={
            <Layout>
              <Football />
            </Layout>
          } />
          <Route path="sports/basketball" element={
            <Layout>
              <Basketball />
            </Layout>
          } />
          <Route path="sports/tennis" element={
            <Layout>
              <Tennis />
            </Layout>
          } />
          <Route path="sports/hockey" element={
            <Layout>
              <Hockey />
            </Layout>
          } />
          <Route path="sports/esports" element={
            <Layout>
              <Esports />
            </Layout>
          } />
          
          {/* Promotions */}
          <Route path="promotions" element={
            <Layout>
              <PromotionsPage />
            </Layout>
          } />
          
          {/* VIP and Bonuses */}
          <Route path="vip" element={
            <Layout>
              <VIPPage />
            </Layout>
          } />
          <Route path="bonuses" element={
            <Layout>
              <BonusHub />
            </Layout>
          } />
          
          {/* KYC */}
          <Route path="kyc" element={
            <Layout>
              <KycForm />
            </Layout>
          } />
          <Route path="kyc/status" element={
            <Layout>
              <KycStatus />
            </Layout>
          } />
          
          {/* User account */}
          <Route path="profile" element={
            <Layout>
              <UserProfile />
            </Layout>
          } />
          <Route path="settings" element={
            <Layout>
              <UserSettings />
            </Layout>
          } />
          <Route path="transactions" element={
            <Layout>
              <UserTransactions />
            </Layout>
          } />
          
          {/* Support */}
          <Route path="help" element={
            <Layout>
              <Help />
            </Layout>
          } />
          <Route path="faq" element={
            <Layout>
              <FAQ />
            </Layout>
          } />
          <Route path="contact" element={
            <Layout>
              <Contact />
            </Layout>
          } />
          <Route path="responsible-gaming" element={
            <Layout>
              <ResponsibleGaming />
            </Layout>
          } />
          
          {/* Legal */}
          <Route path="terms" element={
            <Layout>
              <TermsPage />
            </Layout>
          } />
          <Route path="privacy" element={
            <Layout>
              <PrivacyPage />
            </Layout>
          } />
          
          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <NotFoundPage />
            </Layout>
          } />
          
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
    </BrowserRouter>
  );
}

export default App;
