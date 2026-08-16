import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logger } from './logger.ts';

// Global error handlers to capture and send client-side errors to the backend
window.addEventListener('error', (event) => {
  const msg = (event.message || '').toLowerCase();
  const filename = (event.filename || '').toLowerCase();
  if (msg.includes('websocket') || msg.includes('vite') || filename.includes('vite/client')) {
    return;
  }

  logger.error('Uncaught Exception', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = event.reason instanceof Error ? event.reason.message : String(event.reason);
  const lowerReason = reasonStr.toLowerCase();
  if (lowerReason.includes('websocket') || lowerReason.includes('vite')) {
    return;
  }

  logger.error('Unhandled Promise Rejection', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
