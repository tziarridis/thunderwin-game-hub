
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App.tsx';
import './index.css';
import './App.css';

// Create a root and ensure we're targeting the correct element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Render the app
createRoot(rootElement).render(
  <Router>
    <App />
  </Router>
);
