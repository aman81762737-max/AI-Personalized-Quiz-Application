// Suppress THREE.Clock deprecation warning and benign Vite HMR WebSocket warnings
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const first = typeof args[0] === 'string' ? args[0] : '';
  if (
    first.includes('Clock: This module has been deprecated') ||
    first.includes('THREE.Clock') ||
    first.includes('[vite] failed to connect to websocket')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const first = typeof args[0] === 'string' ? args[0] : '';
  if (
    first.includes('[vite] failed to connect to websocket') ||
    first.includes('WebSocket closed without opened')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = reason?.message || String(reason || '');
    if (msg.includes('WebSocket closed without opened') || msg.includes('[vite]')) {
      event.preventDefault();
    }
  });
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
