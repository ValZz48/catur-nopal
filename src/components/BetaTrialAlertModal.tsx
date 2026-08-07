import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock, X, ArrowRight, Sparkles } from 'lucide-react';

interface BetaTrialAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHideForToday: () => void;
  prefLang: 'id' | 'en';
}

export const BetaTrialAlertModal: React.FC<BetaTrialAlertModalProps> = ({
  isOpen,
  onClose,
  onHideForToday,
  prefLang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#1e1c1b] border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative my-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                Early Access / Beta Test
              </span>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wide mt-1">
              {prefLang === 'en' ? 'Early Test Phase Notice' : 'Pemberitahuan Uji Coba Awal'}
            </h3>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {prefLang === 'en'
              ? 'Welcome to Pal Mate Chess Arena! Please note that this game is currently in early beta testing. Features, ratings, and features are continuously being refined.'
              : 'Selamat datang di Arena Catur Pal Mate! Perlu diketahui bahwa game ini masih berada dalam tahap uji coba awal (Beta Test). Fitur, performa, dan sistem terus kami tingkatkan.'}
          </p>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-200 font-semibold leading-normal">
              {prefLang === 'en'
                ? 'If you encounter any issues or have feedback, you can report them directly via the settings menu.'
                : 'Jika Anda menemukan kendala atau saran perbaikan, Anda dapat melaporkannya melalui menu Pengaturan.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#81b64c] hover:bg-[#6c9c3e] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-[#81b64c]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{prefLang === 'en' ? 'Understand & Continue' : 'Saya Mengerti & Lanjutkan'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            onClick={onHideForToday}
            className="w-full px-3 py-2.5 bg-[#262421] hover:bg-[#322f2b] border border-[#3c3934] text-slate-400 hover:text-white font-bold text-[11px] uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{prefLang === 'en' ? 'Hide for Today' : 'Sembunyikan Hari Ini'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
