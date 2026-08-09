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
  var splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(function(){ splash.remove(); }, 500);
  }
  var studioSplash = document.getElementById('studio-splash');
  if (studioSplash) {
    studioSplash.style.opacity = '0';
    setTimeout(function(){ studioSplash.remove(); }, 500);
  }
}

// Global safety timer in case window load or promises stall on deployed static CDNs
var splashSafetyTimeout = setTimeout(hideSplash, 3500);

Promise.all([
  new Promise(function(res){
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      res(null);
    } else {
      window.addEventListener('load', function(){ res(null); });
      document.addEventListener('DOMContentLoaded', function(){ res(null); });
    }
  }),
  (window as any).__splashReady || Promise.resolve()
]).then(function(){
  clearTimeout(splashSafetyTimeout);
  setTimeout(hideSplash, 250);
}).catch(function(){
  hideSplash();
});

