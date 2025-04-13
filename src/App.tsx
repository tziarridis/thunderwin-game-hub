
import React, { useState, useEffect } from "react";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/layout/Layout";
import AppLayout from "./components/layout/AppLayout"; // Import AppLayout
import AdminLayout from "./components/layout/AdminLayout";
import Home from "./pages/Index";
import CasinoMain from "./pages/casino/CasinoMain";
import Sports from "./pages/sports/Sports";
import Promotions from "./pages/promotions/Promotions";
import Profile from "./pages/user/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/Users";
import GameManagement from "./pages/admin/Games";
import TransactionHistory from "./pages/admin/Transactions";
import AggregatorSettings from "./pages/admin/AggregatorSettings";
import GameAggregatorPage from "./pages/admin/GameAggregator";
import Seamless from "./pages/casino/Seamless";
import ScrollToTop from "./components/layout/ScrollToTop";
import PlaceholderPage from "./components/PlaceholderPage";
import Bonuses from "./pages/bonuses/BonusHub";
import VIP from "./pages/vip/VIP";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="casino" element={<CasinoMain />} />
            <Route path="casino/slots" element={<PlaceholderPage title="Slots" />} />
            <Route path="casino/live-casino" element={<PlaceholderPage title="Live Casino" />} />
            <Route path="casino/seamless" element={<Seamless />} />
            <Route path="sports/*" element={<Sports />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="bonuses" element={<Bonuses />} />
            <Route path="vip" element={<VIP />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="support/help" element={<PlaceholderPage title="Help Center" />} />
            
            {/* Protected User Routes */}
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Admin Login Route (outside of admin layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="games" element={<GameManagement />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="aggregator-settings" element={<AggregatorSettings />} />
            <Route path="game-aggregator" element={<GameAggregatorPage />} />
          </Route>
          
          {/* Catch-all for 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
