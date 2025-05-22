
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App'
import './index.css'
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';
import { GamesProvider } from './hooks/useGames';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="casino-theme">
        <AuthProvider>
          <GamesProvider>
            <App />
            <Toaster position="top-center" richColors />
          </GamesProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
)
