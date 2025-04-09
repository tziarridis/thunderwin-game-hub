
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import Index from "./pages/Index";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import NotFound from "./pages/NotFound";

// Import DollarSign for Footer.tsx which uses it
import { DollarSign } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/casino" element={<Index />} />
            <Route path="/sports" element={<Index />} />
            <Route path="/promotions" element={<Index />} />
            <Route path="/vip" element={<Index />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="transactions" element={<AdminDashboard />} />
            <Route path="reports" element={<AdminDashboard />} />
            <Route path="games" element={<AdminDashboard />} />
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
  </QueryClientProvider>
);

export default App;
