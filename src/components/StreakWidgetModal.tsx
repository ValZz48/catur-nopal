import React, { useState, useEffect } from 'react';
import { Flame, Bell, BellOff, CheckCircle2, Sparkles, Smartphone, X, Send, Download, ArrowRight, ShieldCheck, Zap, Calendar } from 'lucide-react';
import { requestNotificationPermission, sendStreakNotification, isNotificationEnabled } from '../utils/notification';

interface StreakWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  isCheckedInToday: boolean;
  onPerformCheckIn: () => void;
  prefLang: 'id' | 'en';
}

export const StreakWidgetModal: React.FC<StreakWidgetModalProps> = ({
  isOpen,
  onClose,
  streak,
  isCheckedInToday,
  onPerformCheckIn,
  prefLang
}) => {
  const [notifState, setNotifState] = useState<boolean>(false);
  const [notifPermission, setNotifPermission] = useState<string>('default');
  const [testSent, setTestSent] = useState<boolean>(false);
  const [widgetSize, setWidgetSize] = useState<'4x2' | '2x2'>('4x2');

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
      setNotifState(Notification.permission === 'granted' && localStorage.getItem('streak_notifications_enabled') === 'true');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleNotification = async () => {
    if (notifState) {
      localStorage.setItem('streak_notifications_enabled', 'false');
      setNotifState(false);
    } else {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        setNotifState(true);
        sendStreakNotification(
          'Pengingat Streak Aktif!',
          'Notifikasi pengingat streak catur harian telah berhasil diaktifkan. Pal Mate akan mengingatkanmu setiap hari!'
        );
      }
    }
  };

  const handleSendTestNotification = async () => {
    if (notifPermission !== 'granted') {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);
      if (perm !== 'granted') return;
    }
    const success = await sendStreakNotification(
      `Pengingat Streak Catur (${streak} Hari)`,
      `Jangan biarkan streak beruntun-mu padam! Mainkan 1 teka-teki catur atau check-in sekarang!`
    );
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#181615] border-2 border-[#81b64c]/50 rounded-3xl max-w-xl w-full p-4 sm:p-6 text-white shadow-2xl relative my-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-[#262421] rounded-full border border-[#3c3934] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white fill-white/20" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              {prefLang === 'en' ? 'Mobile Widget & Streak Reminder' : 'Widget HP & Notifikasi Streak'}
            </h3>
            <p className="text-xs text-[#9babaf] font-semibold">
              {prefLang === 'en'
                ? 'Check-in daily and never break your streak on Android/iOS'
                : 'Pasang widget check-in di layar HP & aktifkan pengingat streak harian'}
            </p>
          </div>
        </div>

        {/* NOTIFICATION TOGGLE & TEST REMINDER BAR */}
        <div className="bg-[#262421] p-3.5 sm:p-4 rounded-2xl border border-[#3c3934] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${notifState ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                {notifState ? <Bell className="w-5 h-5 text-emerald-400 animate-bounce" /> : <BellOff className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {prefLang === 'en' ? 'Daily Streak Notification' : 'Notifikasi Pengingat Streak Harian'}
                </h4>
                <p className="text-[11px] text-[#9babaf]">
                  {notifState 
                    ? (prefLang === 'en' ? 'Active: Will remind you if un-checked' : 'Aktif: Akan mengingatkan jika belum check-in') 
                    : (prefLang === 'en' ? 'Disabled: Tap to enable reminders' : 'Non-aktif: Ketuk untuk mengaktifkan pengingat')}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleNotification}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                notifState 
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20' 
                  : 'bg-[#81b64c] text-slate-950 hover:bg-[#6c9c3e] shadow-md shadow-[#81b64c]/20'
              }`}
            >
              {notifState ? (prefLang === 'en' ? 'Active ✓' : 'Aktif ✓') : (prefLang === 'en' ? 'Enable' : 'Aktifkan')}
            </button>
          </div>

          {/* Test Push Button */}
          <button
            onClick={handleSendTestNotification}
            className="w-full py-2 px-3 bg-[#1e1c1b] hover:bg-[#322f2b] border border-[#3c3934] hover:border-[#81b64c]/50 text-amber-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {testSent 
              ? (prefLang === 'en' ? '✓ Notification Sent to Device!' : '✓ Notifikasi Pengingat Terkirim ke HP!') 
              : (prefLang === 'en' ? 'Send Test Streak Notification to Phone' : 'Uji Coba Kirim Notifikasi Pengingat ke HP')}
          </button>
        </div>

        {/* WIDGET PREVIEW SIMULATOR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-400" />
              {prefLang === 'en' ? 'Home Screen Widget Simulation' : 'Simulasi Widget Layar HP'}
            </span>

            {/* Widget Size Toggle */}
            <div className="flex items-center gap-1 bg-[#262421] p-1 rounded-lg border border-[#3c3934]">
              <button
                onClick={() => setWidgetSize('4x2')}
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase cursor-pointer ${widgetSize === '4x2' ? 'bg-[#81b64c] text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                Ukuran 4x2
              </button>
              <button
                onClick={() => setWidgetSize('2x2')}
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase cursor-pointer ${widgetSize === '2x2' ? 'bg-[#81b64c] text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                Ukuran 2x2
              </button>
            </div>
          </div>

          {/* Realistic Mobile Device Frame */}
          <div className="relative bg-gradient-to-b from-[#111827] via-[#1f2937] to-[#0f172a] rounded-3xl p-4 sm:p-5 border-4 border-slate-700 shadow-2xl overflow-hidden select-none">
            
            {/* Status bar mock */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-4 px-1">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <div className="w-4 h-2 bg-slate-300 rounded-xs"></div>
              </div>
            </div>

            {/* THE WIDGET CONTENT */}
            {widgetSize === '4x2' ? (
              /* 4x2 Wide Widget */
              <div className="bg-gradient-to-br from-[#1e1c1b]/95 to-[#2a2725]/95 border-2 border-[#81b64c] rounded-2xl p-4 text-white shadow-xl backdrop-blur-md relative overflow-hidden space-y-3">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#81b64c]/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-400 fill-orange-400/20 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#9babaf] tracking-wider block">
                        PAL MATE CHESS STREAK
                      </span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {streak} HARI BERUNTUN
                      </span>
                    </div>
                  </div>

                  {isCheckedInToday ? (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Checked-In
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Belum Check-In
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#3c3934]">
                  <div className="text-[11px] text-slate-300 font-medium">
                    {isCheckedInToday 
                      ? 'Hadiah Absensi Hari Ini Selesai Diklaim' 
                      : 'Ketuk tombol di samping untuk check-in instan dari Widget HP'}
                  </div>

                  {!isCheckedInToday ? (
                    <button
                      onClick={onPerformCheckIn}
                      className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 shrink-0 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      Check-In
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3.5 py-2 bg-slate-800 text-slate-400 font-extrabold text-xs rounded-xl shrink-0 cursor-not-allowed flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Sudah Check-In
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* 2x2 Compact Widget */
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-[#1e1c1b]/95 to-[#2a2725]/95 border-2 border-orange-500 rounded-2xl p-4 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <Flame className="w-7 h-7 text-orange-400 fill-orange-400/20 animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                    Pal Mate
                  </span>
                </div>

                <div className="text-center my-auto">
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {streak} <span className="text-xs">HARI</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-bold block mt-0.5">
                    {isCheckedInToday ? 'Checked-In' : 'Perlu Check-In'}
                  </span>
                </div>

                {!isCheckedInToday ? (
                  <button
                    onClick={onPerformCheckIn}
                    className="w-full py-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-[11px] uppercase rounded-lg cursor-pointer"
                  >
                    Check-In
                  </button>
                ) : (
                  <div className="w-full py-1 bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase rounded-lg text-center border border-emerald-500/30">
                    Klaim Selesai
                  </div>
                )}
              </div>
            )}

            {/* Mock App Icons under widget */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-blue-600/80 flex items-center justify-center text-[10px] font-black text-white">
                  Chrome
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/80 flex items-center justify-center text-[10px] font-black text-white">
                  WA
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-orange-600 border border-orange-400/50 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-orange-500/30">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="text-[9px] text-slate-300 font-bold">Pal Mate</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-purple-600/80 flex items-center justify-center text-[10px] font-black text-white">
                  Settings
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INSTRUCTIONS ON HOW TO ADD TO HOME SCREEN / WIDGET */}
        <div className="bg-[#262421] p-3.5 sm:p-4 rounded-2xl border border-[#3c3934] space-y-2 text-left">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-amber-400" />
            {prefLang === 'en' ? 'How to Add Pal Mate Widget on Android/iOS:' : 'Cara Memasang Widget HP Pal Mate:'}
          </h4>
          <ol className="text-xs text-slate-300 space-y-1.5 font-medium list-decimal list-inside pl-1">
            <li>
              {prefLang === 'en'
                ? 'Open browser options menu (⋮) and choose "Add to Home screen" or "Install App".'
                : 'Buka menu browser (⋮) lalu pilih "Tambahkan ke Layar Utama" / "Instal Aplikasi".'}
            </li>
            <li>
              {prefLang === 'en'
                ? 'On Android home screen, press and hold an empty space, tap "Widgets" and select Pal Mate.'
                : 'Di layar utama HP Android, tekan dan tahan area kosong layar, lalu pilih menu "Widget" & pilih Pal Mate.'}
            </li>
            <li>
              {prefLang === 'en'
                ? 'Place the Widget on your home screen for 1-tap check-in and daily streak updates!'
                : 'Tempatkan widget di layar HP untuk check-in 1-ketuk dan pengingat streak otomatis!'}
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
};
