
import React from 'react';
import {
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import { AppLayout } from './components/layout/AppLayout';

// Placeholder for pages that haven't been created yet
import PlaceholderPage from './components/PlaceholderPage';

function App() {
  return (
    <>
      <Toaster richColors closeButton />
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<PlaceholderPage title="Home" />} />
          <Route path="/games" element={<PlaceholderPage title="Games" />} />
          <Route path="/games/:id" element={<PlaceholderPage title="Game Details" />} />
          <Route path="/promotions" element={<PlaceholderPage title="Promotions" />} />
          <Route path="/support" element={<PlaceholderPage title="Support" />} />
          <Route path="/register" element={<PlaceholderPage title="Register" />} />
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route path="/terms" element={<PlaceholderPage title="Terms" />} />
          <Route path="/privacy" element={<PlaceholderPage title="Privacy" />} />
          <Route path="/verify-email" element={<PlaceholderPage title="Verify Email" />} />
        </Route>

        {/* User Dashboard Routes - using placeholders */}
        <Route
          path="/dashboard"
          element={<PlaceholderPage title="User Dashboard" />}
        />
        <Route
          path="/profile"
          element={<PlaceholderPage title="User Profile" />}
        />
        <Route
          path="/transactions"
          element={<PlaceholderPage title="Transactions" />}
        />
        <Route
          path="/my-bonuses"
          element={<PlaceholderPage title="My Bonuses" />}
        />
        <Route
          path="/my-affiliate"
          element={<PlaceholderPage title="My Affiliate" />}
        />

        {/* Admin Dashboard Routes - using placeholders */}
        <Route path="/admin/login" element={<PlaceholderPage title="Admin Login" />} />
        <Route path="/admin" element={<PlaceholderPage title="Admin Layout" />}>
          <Route index element={<PlaceholderPage title="Admin Dashboard" />} />
          <Route path="users" element={<PlaceholderPage title="User Management" />} />
          <Route path="transactions" element={<PlaceholderPage title="Transaction Management" />} />
          <Route path="reports" element={<PlaceholderPage title="Report Management" />} />
          <Route path="games" element={<PlaceholderPage title="Game Management" />} />
          <Route path="games/new" element={<PlaceholderPage title="New Game Form" />} />
          <Route path="games/edit/:id" element={<PlaceholderPage title="Edit Game Form" />} />
          <Route path="promotions" element={<PlaceholderPage title="Promotion Management" />} />
          <Route path="affiliates" element={<PlaceholderPage title="Affiliate Management" />} />
          <Route path="kyc" element={<PlaceholderPage title="KYC Management" />} />
          <Route path="vip-management" element={<PlaceholderPage title="VIP Management" />} />
          <Route path="security" element={<PlaceholderPage title="Security Settings" />} />
          <Route path="logs" element={<PlaceholderPage title="System Logs" />} />
          <Route path="settings" element={<PlaceholderPage title="Admin Settings" />} />
          <Route path="bonuses" element={<PlaceholderPage title="Bonus Management" />} />
          <Route path="bonuses/new" element={<PlaceholderPage title="New Bonus Form" />} />
          <Route path="bonuses/edit/:id" element={<PlaceholderPage title="Edit Bonus Form" />} />
          <Route path="segmentation" element={<PlaceholderPage title="Player Segmentation" />} />
        </Route>

        {/* Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
