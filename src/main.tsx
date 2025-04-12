
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize the database with mock data
import './utils/dbInitializer';

// Create a root
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(<App />);
