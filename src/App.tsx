import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'sonner';

// Public Pages
import Home from './pages/Home';
import Games from './pages/Games';
import Promotions from './pages/Promotions';
import Support from './pages/Support';
import Register from './pages/Register';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import GameDetails from './pages/GameDetails';

// User Dashboard Pages
import Dashboard from './pages/user/Dashboard';
import UserProfile from './pages/user/UserProfile';
import Transactions from './pages/user/Transactions';
import MyBonuses from './pages/user/MyBonuses';
import MyAffiliate from './pages/user/MyAffiliate';
import VerifyEmail from './pages/VerifyEmail';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TransactionManagement from './pages/admin/TransactionManagement';
import ReportManagement from './pages/admin/ReportManagement';
import GameManagement from './pages/admin/GameManagement';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/layout/AdminLayout';
import GameForm from './pages/admin/GameForm';
import PromotionManagement from './pages/admin/Promotions';
import AffiliateManagement from './pages/admin/AffiliateManagement';
import KycManagement from './pages/admin/KycManagement';
import VipManagement from './pages/admin/VipManagement';
import SecuritySettings from './pages/admin/SecuritySettings';
import SystemLogs from './pages/admin/SystemLogs';
import AdminSettings from './pages/admin/AdminSettings';
import BonusManagement from './pages/admin/BonusManagement';
import BonusForm from './pages/admin/BonusForm';
import PlayerSegmentation from "@/pages/admin/PlayerSegmentation";

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import UserLayout from './components/layout/UserLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer richColors closeButton />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
             <Route path="/games/:id" element={<GameDetails />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/support" element={<Support />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>

          {/* User Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserLayout><Dashboard /></UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserLayout><UserProfile /></UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <UserLayout><Transactions /></UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bonuses"
            element={
              <ProtectedRoute>
                <UserLayout><MyBonuses /></UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-affiliate"
            element={
              <ProtectedRoute>
                <UserLayout><MyAffiliate /></UserLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute isAdmin={true}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="transactions" element={<TransactionManagement />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="games" element={<GameManagement />} />
              <Route path="games/new" element={<GameForm />} />
              <Route path="games/edit/:id" element={<GameForm />} />
            <Route path="promotions" element={<PromotionManagement />} />
            <Route path="affiliates" element={<AffiliateManagement />} />
            <Route path="kyc" element={<KycManagement />} />
            <Route path="vip-management" element={<VipManagement />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="logs" element={<SystemLogs />} />
            <Route path="settings" element={<AdminSettings />} />
              <Route path="bonuses" element={<BonusManagement />} />
              <Route path="bonuses/new" element={<BonusForm />} />
              <Route path="bonuses/edit/:id" element={<BonusForm />} />
              <Route path="segmentation" element={<PlayerSegmentation />} />
          </Route>

          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
