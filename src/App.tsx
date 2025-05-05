
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import Index from './pages/Index';
import CasinoMain from './pages/casino/CasinoMain';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { toast, Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';

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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/casino" element={<CasinoMain />} />
            
            {/* Add the route for aggregator games */}
            <Route path="/casino/aggregator-games" element={<AggregatorGames />} />
            
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
