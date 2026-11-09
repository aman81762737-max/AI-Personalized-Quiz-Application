// Suppress THREE.Clock deprecation warning from Three.js r186+
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Clock: This module has been deprecated') ||
      args[0].includes('THREE.Clock'))
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
