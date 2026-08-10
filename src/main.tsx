import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

function hideSplash() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.pointerEvents = 'none';
    splash.style.opacity = '0';
    setTimeout(() => { if (splash && splash.parentNode && splash.id !== 'root') splash.remove(); }, 500);
  }
  const studioSplash = document.getElementById('studio-splash');
  if (studioSplash) {
    studioSplash.style.pointerEvents = 'none';
    studioSplash.style.opacity = '0';
    setTimeout(() => { if (studioSplash && studioSplash.parentNode && studioSplash.id !== 'root') studioSplash.remove(); }, 500);
  }
}

// Guaranteed safety fallback: remove splash screens after max 2.5 seconds
const fallbackTimer = setTimeout(hideSplash, 2500);

Promise.all([
  new Promise((resolve) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      resolve(null);
    } else {
      window.addEventListener('DOMContentLoaded', () => resolve(null));
      window.addEventListener('load', () => resolve(null));
    }
  }),
  (window as any).__splashReady || Promise.resolve()
]).then(() => {
  clearTimeout(fallbackTimer);
  setTimeout(hideSplash, 100);
}).catch(() => {
  clearTimeout(fallbackTimer);
  hideSplash();
});
