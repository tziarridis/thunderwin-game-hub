
import React, { useState, useEffect } from "react";
import {
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Index";
import CasinoMain from "./pages/casino/CasinoMain";
import Sports from "./pages/sports/Sports";
import Promotions from "./pages/promotions/Promotions";
import Profile from "./pages/user/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/Users";
import GameManagement from "./pages/admin/Games";
import TransactionHistory from "./pages/admin/Transactions";
import AggregatorSettings from "./pages/admin/AggregatorSettings";
import GameAggregatorPage from "./pages/admin/GameAggregator";
import Seamless from "./pages/casino/Seamless";
import ScrollToTop from "./components/layout/ScrollToTop";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [loading, setLoading] = useState(true);

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

  // Set up routes
  const routes = [
    { path: "/", element: <Home /> },
    { path: "/casino", element: <CasinoMain /> },
    { path: "/sportsbook", element: <Sports /> },
    { path: "/promotions", element: <Promotions /> },
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    {
      path: "/admin",
      element: (
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/users",
      element: (
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/games",
      element: (
        <ProtectedRoute>
          <GameManagement />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/transactions",
      element: (
        <ProtectedRoute>
          <TransactionHistory />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/AggregatorSettings",
      element: (
        <ProtectedRoute>
          <AggregatorSettings />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/GameAggregator",
      element: (
        <ProtectedRoute>
          <GameAggregatorPage />
        </ProtectedRoute>
      ),
    },
    { path: "/casino/seamless", element: <Seamless /> },
  ];

  return (
    <ThemeProvider>
      <AuthProvider>
        <ScrollToTop />
        <Layout>
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
