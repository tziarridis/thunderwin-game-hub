
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

// Initialize the database with mock data
import './utils/dbInitializer';

// Create a root
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);
