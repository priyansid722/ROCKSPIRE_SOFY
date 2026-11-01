/*
 * main.tsx — Application entry point
 *
 * Mounts the React app, imports global styles and Google Fonts.
 * This is the only place global CSS is imported.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global styles — must be imported before any component styles
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in index.html');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
