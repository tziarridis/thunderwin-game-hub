
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App'
import './index.css'
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
)
