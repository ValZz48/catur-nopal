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
                }
                Promise.all([
                  new Promise(function(res){
                      if (document.readyState === 'complete') res(null);
                          else window.addEventListener('load', function(){ res(null); });
                            }),
                              (window as any).__splashReady || Promise.resolve()
                              ]).then(function(){
                                setTimeout(hideSplash, 250);
                                });
