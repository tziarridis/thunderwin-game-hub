
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/layout/ScrollToTop";
import TableGamesPage from "./pages/casino/TableGames";
import NewGamesPage from "./pages/casino/NewGames";
import Providers from "./pages/casino/Providers";
import KycStatusPage from "./pages/kyc/KycStatus";
import Index from "./pages/Index";
import Sports from "./pages/sports";
import LiveCasinoPage from "./pages/casino/LiveCasino";
import SlotsPage from "./pages/casino/Slots";
import JackpotsPage from "./pages/casino/Jackpots";
import HelpPage from "./pages/support/Help";
import ProfilePage from "./pages/user/Profile";
import BonusHub from "./pages/bonuses/BonusHub";
import FaqPage from "./pages/support/Faq";
import ContactPage from "./pages/support/Contact";
import ResponsibleGamingPage from "./pages/support/ResponsibleGaming";
import TermsPage from "./pages/legal/Terms";
import PrivacyPage from "./pages/legal/Privacy";
import VIPPage from "./pages/vip/VIP";
import PromotionsPage from "./pages/promotions/Promotions";
import FavoritesPage from "./pages/casino/Favorites";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CasinoMain from "./pages/casino/CasinoMain";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CMSOverview from "./pages/admin/cms/CMSOverview";
import { useState } from "react";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Index />} />
          
          {/* Casino routes */}
          <Route path="/casino" element={<CasinoMain />} />
          <Route path="/casino/table-games" element={<TableGamesPage />} />
          <Route path="/casino/new-games" element={<NewGamesPage />} />
          <Route path="/casino/providers" element={<Providers />} />
          <Route path="/casino/slots" element={<SlotsPage />} />
          <Route path="/casino/live-casino" element={<LiveCasinoPage />} />
          <Route path="/casino/jackpots" element={<JackpotsPage />} />
          <Route path="/casino/crash" element={<NotFound />} />
          <Route path="/casino/favorites" element={<FavoritesPage />} />
          <Route path="/casino/gitslotpark-seamless" element={<NotFound />} />
          
          {/* Core pages */}
          <Route path="/games" element={<NotFound />} />
          <Route path="/games/:id" element={<NotFound />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/bonuses" element={<BonusHub />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/vip" element={<VIPPage />} />
          
          {/* Sports routes */}
          <Route path="/sports" element={<Sports />} />
          <Route path="/sports/football" element={<NotFound />} />
          <Route path="/sports/basketball" element={<NotFound />} />
          <Route path="/sports/tennis" element={<NotFound />} />
          <Route path="/sports/hockey" element={<NotFound />} />
          <Route path="/sports/esports" element={<NotFound />} />
          
          {/* Support routes */}
          <Route path="/support/help" element={<HelpPage />} />
          <Route path="/support/faq" element={<FaqPage />} />
          <Route path="/support/contact" element={<ContactPage />} />
          <Route path="/support/responsible-gaming" element={<ResponsibleGamingPage />} />
          
          {/* Legal pages */}
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          
          {/* User pages */}
          <Route path="/transactions" element={<NotFound />} />
          <Route path="/settings" element={<NotFound />} />
          
          {/* Auth routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<NotFound />} />
          <Route path="/reset-password/:token" element={<NotFound />} />
          <Route path="/kyc/status" element={<KycStatusPage />} />
          
          {/* Admin login */}
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>
        
        {/* Admin routes with AdminLayout */}
        <Route element={<AdminLayout collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<NotFound />} />
          <Route path="/admin/games" element={<NotFound />} />
          <Route path="/admin/game-aggregator" element={<NotFound />} />
          <Route path="/admin/aggregator-settings" element={<NotFound />} />
          <Route path="/admin/transactions" element={<NotFound />} />
          <Route path="/admin/affiliates" element={<NotFound />} />
          <Route path="/admin/promotions" element={<NotFound />} />
          <Route path="/admin/vip-bonus" element={<NotFound />} />
          <Route path="/admin/kyc" element={<NotFound />} />
          <Route path="/admin/reports" element={<NotFound />} />
          <Route path="/admin/logs" element={<NotFound />} />
          <Route path="/admin/support" element={<NotFound />} />
          <Route path="/admin/security" element={<NotFound />} />
          <Route path="/admin/settings" element={<NotFound />} />
          
          {/* CMS Routes */}
          <Route path="/admin/cms" element={<CMSOverview />} />
          <Route path="/admin/cms/banners" element={<NotFound />} />
          <Route path="/admin/cms/casino" element={<NotFound />} />
          <Route path="/admin/cms/categories" element={<NotFound />} />
          <Route path="/admin/cms/sportsbook" element={<NotFound />} />
          <Route path="/admin/cms/site-data" element={<NotFound />} />
          <Route path="/admin/cms/games" element={<NotFound />} />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
