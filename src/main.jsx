/**
 * Avira E-Commerce - Entry Point
 * Premium Heritage E-Commerce Application
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global styles (includes variables.css via import)
import './styles/global.css';

// Note: iOS Safari viewport fix is now handled by blocking script in index.html
// This ensures viewport height is set BEFORE first paint to prevent layout flash

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
