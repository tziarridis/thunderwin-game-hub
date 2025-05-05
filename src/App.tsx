import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import Index from './pages/Index';
import CasinoMain from './pages/casino/CasinoMain';
import SlotsPage from './pages/casino/SlotsPage';
import TableGamesPage from './pages/casino/TableGames';
import LiveCasinoPage from './pages/casino/LiveCasino';
import JackpotsPage from './pages/casino/JackpotsPage';
import NewGamesPage from './pages/casino/NewGames';
import PopularGamesPage from './pages/casino/PopularGames';
import GameDetailsPage from './pages/casino/GameDetailsPage';
import ProviderGamesPage from './pages/casino/ProviderGamesPage';
import PaymentPage from './pages/payment/PaymentPage';
import Deposit from './pages/payment/Deposit';
import Withdraw from './pages/payment/Withdraw';
import Transactions from './pages/payment/Transactions';
import Profile from './pages/user/Profile';
import Bonuses from './pages/user/Bonuses';
import Support from './pages/support/Support';
import HelpCenter from './pages/support/HelpCenter';
import ContactUs from './pages/support/ContactUs';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import ResponsibleGaming from './pages/legal/ResponsibleGaming';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import GameManagement from './pages/admin/GameManagement';
import ProviderManagement from './pages/admin/ProviderManagement';
import UserManagement from './pages/admin/UserManagement';
import BonusManagement from './pages/admin/BonusManagement';
import Settings from './pages/admin/Settings';
import GameAggregatorPage from './pages/admin/GameAggregator';
import PPIntegrationTester from './pages/admin/PPIntegrationTester';
import AggregatorSettings from './pages/admin/AggregatorSettings';
import GitSlotParkSeamless from './pages/casino/GitSlotParkSeamless';
import SeamlessIntegration from './pages/casino/SeamlessIntegration';
import GameLauncherPage from './pages/games/GameLauncherPage';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'sonner';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { ThemeProvider } from './components/theme-provider';
import { ScrollToTop } from './utils/scrollUtils';

// Add the import for AggregatorGames
import AggregatorGames from './pages/casino/AggregatorGames';

function App() {
  useEffect(() => {
    // Initialize GA here
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-react-theme">
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/casino" element={<CasinoMain />} />
            <Route path="/casino/slots" element={<SlotsPage />} />
            <Route path="/casino/table-games" element={<TableGamesPage />} />
            <Route path="/casino/live-casino" element={<LiveCasinoPage />} />
            <Route path="/casino/jackpots" element={<JackpotsPage />} />
            <Route path="/casino/new" element={<NewGamesPage />} />
            <Route path="/casino/popular" element={<PopularGamesPage />} />
            <Route path="/casino/game/:id" element={<GameDetailsPage />} />
            <Route path="/casino/provider/:provider" element={<ProviderGamesPage />} />
            <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/payment/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/payment/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/payment/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/bonuses" element={<ProtectedRoute><Bonuses /></ProtectedRoute>} />
            <Route path="/support" element={<Support />} />
            <Route path="/support/help" element={<HelpCenter />} />
            <Route path="/support/contact" element={<ContactUs />} />
            <Route path="/legal/terms" element={<TermsAndConditions />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/responsible-gaming" element={<ResponsibleGaming />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/game-management" element={<AdminRoute><GameManagement /></AdminRoute>} />
            <Route path="/admin/provider-management" element={<AdminRoute><ProviderManagement /></AdminRoute>} />
            <Route path="/admin/user-management" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/bonus-management" element={<AdminRoute><BonusManagement /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
            <Route path="/admin/game-aggregator" element={<AdminRoute><GameAggregatorPage /></AdminRoute>} />
            <Route path="/admin/pp-integration-tester" element={<AdminRoute><PPIntegrationTester /></AdminRoute>} />
            <Route path="/admin/aggregator-settings" element={<AdminRoute><AggregatorSettings /></AdminRoute>} />
            <Route path="/casino/gitslotpark-seamless" element={<GitSlotParkSeamless />} />
            <Route path="/casino/seamless" element={<SeamlessIntegration />} />
            <Route path="/game-launcher/:gameId" element={<GameLauncherPage />} />
            
            {/* Add the new route for aggregator games */}
            <Route path="/casino/aggregator-games" element={<AggregatorGames />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <ToastContainer />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
