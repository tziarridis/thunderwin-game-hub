
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminGames from "./pages/admin/Games";
import AdminTransactions from "./pages/admin/Transactions";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import GameDetails from "./pages/casino/GameDetails";
import Profile from "./pages/user/Profile";
import Transactions from "./pages/user/Transactions";
import Settings from "./pages/user/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/casino" element={<Index />} />
              <Route path="/casino/game/:id" element={<GameDetails />} />
              <Route path="/sports" element={<Index />} />
              <Route path="/promotions" element={<Index />} />
              <Route path="/vip" element={<Index />} />
              
              {/* User routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="games" element={<AdminGames />} />
              <Route path="reports" element={<AdminDashboard />} />
              <Route path="support" element={<AdminDashboard />} />
              <Route path="logs" element={<AdminDashboard />} />
              <Route path="security" element={<AdminDashboard />} />
              <Route path="settings" element={<AdminDashboard />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
