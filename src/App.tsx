import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Casino } from "./pages/Casino";
import { Sportsbook } from "./pages/Sportsbook";
import { Promotions } from "./pages/Promotions";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { Registration } from "./pages/Registration";
import { ForgotPassword } from "./pages/ForgotPassword";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { GameManagement } from "./pages/admin/GameManagement";
import { TransactionHistory } from "./pages/admin/TransactionHistory";
import { AggregatorSettings } from "./pages/admin/AggregatorSettings";
import { GameAggregatorPage } from "./pages/admin/GameAggregator";
import { useAuth } from "./contexts/AuthContext";
import { Seamless } from "./pages/casino/Seamless";

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
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
    { path: "/casino", element: <Casino /> },
    { path: "/sportsbook", element: <Sportsbook /> },
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
    { path: "/register", element: <Registration /> },
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
        <Router>
          <Layout>
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
