import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, ExternalLink, Globe, Shield, Sparkles, X, ArrowRight, Copy } from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefLang: 'id' | 'en';
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose, prefLang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        prefLang === 'en'
          ? 'To install on Android:\n1. Open menu (⋮) in Chrome\n2. Tap "Add to Home screen" or "Install app"'
          : 'Untuk memasang di HP Android:\n1. Buka menu titik tiga (⋮) di browser Chrome\n2. Pilih "Tambahkan ke Layar Utama" atau "Instal Aplikasi"'
      );
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#1e1c1b] border-2 border-[#81b64c]/40 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative my-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-[#262421] rounded-full border border-[#3c3934] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#81b64c]/20 border border-[#81b64c]/50 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-[#81b64c]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              {prefLang === 'en' ? 'Download & Install App' : 'Unduh & Pasang Aplikasi APK'}
            </h3>
            <p className="text-xs text-[#9babaf] font-semibold">
              {prefLang === 'en' 
                ? 'Play Pal Mate anytime directly on your Android phone' 
                : 'Mainkan Pal Mate kapan saja langsung di HP Android Anda'}
            </p>
          </div>
        </div>

        {/* PWA Direct Installation Card */}
        <div className="bg-gradient-to-br from-[#81b64c]/20 via-[#262421] to-[#121110] p-4 rounded-2xl border border-[#81b64c]/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs font-black uppercase text-white tracking-wide">
                {prefLang === 'en' ? 'Method 1: Direct PWA Install' : 'Metode 1: Pasang Langsung di Layar HP (PWA)'}
              </span>
            </div>
            <span className="bg-[#81b64c] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {prefLang === 'en' ? 'Recommended' : 'Sangat Direkomendasikan'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {prefLang === 'en'
              ? 'Install directly without taking storage space. Runs fast with native app icons & full-screen mode on Android.'
              : 'Pasang aplikasi tanpa memakan memori internal HP. Berjalan cepat dengan ikon aplikasi resmi di layar utama Android.'}
          </p>

          <button
            onClick={handleInstallPWA}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#81b64c] to-emerald-600 hover:from-emerald-500 hover:to-[#81b64c] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#81b64c]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isInstalled ? (
              <>
                <CheckCircle className="w-4 h-4 text-slate-950" />
                {prefLang === 'en' ? 'App Installed on Device' : 'Aplikasi Sudah Terpasang di HP'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                {prefLang === 'en' ? 'Install App to Home Screen' : 'Pasang Aplikasi Sekarang ke HP'}
              </>
            )}
          </button>
        </div>

        {/* Android Steps Instructions */}
        <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] space-y-3 text-left">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-amber-400" />
            {prefLang === 'en' ? 'Steps to Install on Android Chrome:' : 'Cara Pasang Manual di Chrome Android:'}
          </h4>
          <ol className="text-xs text-slate-300 space-y-2 font-medium list-decimal list-inside pl-1">
            <li>
              {prefLang === 'en' 
                ? 'Open Chrome option menu by tapping the 3 dots (⋮) in top-right.' 
                : 'Buka menu opsi Chrome dengan menekan titik tiga (⋮) di kanan atas HP.'}
            </li>
            <li>
              {prefLang === 'en' 
                ? 'Tap "Add to Home Screen" or "Install App".' 
                : 'Pilih opsi "Tambahkan ke Layar Utama" atau "Instal Aplikasi".'}
            </li>
            <li>
              {prefLang === 'en' 
                ? 'Tap "Install". The Pal Mate icon will appear in your Android App Drawer!' 
                : 'Tekan "Instal". Ikon Pal Mate akan langsung muncul di daftar aplikasi HP Anda!'}
            </li>
          </ol>
        </div>

        {/* Method 2: Convert to APK / Download Source */}
        <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] space-y-3 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-400" />
              {prefLang === 'en' ? 'Method 2: Convert Web App to APK File' : 'Metode 2: Ubah Web App Jadi File .APK'}
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {prefLang === 'en'
              ? 'To generate a standalone .apk installer file, you can copy this Web App URL or export the source code via the top-right Settings menu (Export ZIP/GitHub) and compile with PWABuilder / Capacitor.'
              : 'Untuk membuat installer file .apk mandiri, Anda bisa menyalin URL web ini atau mengunduh source code dari menu Pengaturan kanan atas (Ekspor ZIP / GitHub) lalu dikompilasi dengan PWABuilder / Capacitor.'}
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleCopyUrl}
              className="flex-1 py-2.5 px-3 bg-[#3c3934] hover:bg-slate-700 text-white font-bold text-[11px] rounded-xl border border-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-sky-400" />
              {copiedUrl
                ? (prefLang === 'en' ? 'URL Copied!' : 'URL Berhasil Disalin!')
                : (prefLang === 'en' ? 'Copy App URL' : 'Salin Link Web App')}
            </button>

            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-3 bg-[#3c3934] hover:bg-slate-700 text-sky-300 font-bold text-[11px] rounded-xl border border-sky-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>PWABuilder (Bikin APK)</span>
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-[11px] text-[#9babaf] font-semibold pt-1 border-t border-[#3c3934]">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            100% Aman & Terverifikasi
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold uppercase tracking-wider"
          >
            {prefLang === 'en' ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
