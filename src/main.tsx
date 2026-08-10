import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

function hideSplash() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => { if (splash && splash.parentNode) splash.remove(); }, 500);
  }
  const studioSplash = document.getElementById('studio-splash');
  if (studioSplash) {
    studioSplash.style.opacity = '0';
    setTimeout(() => { if (studioSplash && studioSplash.parentNode) studioSplash.remove(); }, 500);
  }
}

// Guaranteed safety fallback: remove splash screens after max 4.5 seconds
const fallbackTimer = setTimeout(hideSplash, 4500);

Promise.all([
  new Promise((resolve) => {
    if (document.readyState === 'complete') resolve(null);
    else window.addEventListener('load', () => resolve(null));
  }),
  (window as any).__splashReady || Promise.resolve()
]).then(() => {
  clearTimeout(fallbackTimer);
  setTimeout(hideSplash, 250);
}).catch(() => {
  clearTimeout(fallbackTimer);
  hideSplash();
});
