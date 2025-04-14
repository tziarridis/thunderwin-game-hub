
// Import React and necessary hooks
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// Auth provider
import { AuthProvider } from "./contexts/AuthContext";

// Layout components
import Layout from "./components/layout/Layout";

// Pages
import IndexPage from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-casino-thunder-darker text-white">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<IndexPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
