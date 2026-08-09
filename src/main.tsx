import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

function hideSplash() {
  var splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(function(){ if (splash.parentNode) splash.remove(); }, 500);
  }
  var studioSplash = document.getElementById('studio-splash');
  if (studioSplash) {
    studioSplash.style.opacity = '0';
    setTimeout(function(){ if (studioSplash.parentNode) studioSplash.remove(); }, 500);
  }
}

// Fade out splash once Pal Mate animation completes
if ((window as any).__splashReady) {
  (window as any).__splashReady.then(function() {
    setTimeout(hideSplash, 100);
  }).catch(function() {
    hideSplash();
  });
} else {
  hideSplash();
}
