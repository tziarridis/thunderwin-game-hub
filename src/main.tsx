
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { supabase } from './integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

// Create a root
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Check if we have an existing session
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log("Supabase session:", session ? "Active" : "None");
});

// Track auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state change:", event, session ? "Session exists" : "No session");
});

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </Router>
  </QueryClientProvider>
);
