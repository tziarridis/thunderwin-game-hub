
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

// Initialize browser database
import initializeDatabase from './utils/dbInitializer';

// Adding a more robust init process
const initApp = async () => {
  try {
    // Initialize the database
    await initializeDatabase();
    console.log("Database initialization completed successfully");
    
    // Create root element for React app
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("Failed to find the root element");
    
    // Render the app
    createRoot(rootElement).render(
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    );
  } catch (error) {
    console.error("Error during app initialization:", error);
    
    // Fallback rendering in case of initialization error
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; color: white;">
          <h1>ThunderWin Casino</h1>
          <p>We're experiencing technical difficulties. Please try again in a few moments.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #00FF66; color: black; border: none; border-radius: 4px; cursor: pointer;">
            Retry
          </button>
        </div>
      `;
    }
  }
};

// Start the application
initApp();
