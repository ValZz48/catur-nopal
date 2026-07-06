import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  HelpCircle, 
  Coins, 
  Gem, 
  X, 
  AlertOctagon, 
  CheckCircle,
  TrendingDown,
  CornerDownRight,
  ShieldAlert
} from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'danger' | 'warning' | 'info' | 'success';
  cost?: {
    amount: number;
    type: 'coin' | 'diamond';
  };
  currentBalance?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Proses',
  cancelText = 'Batal',
  severity = 'info',
  cost,
  currentBalance = 0,
  onConfirm,
  onCancel,
}) => {
  // ESC key listener to safely dismiss the dialog
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Determine icon and color mapping based on severity
  const getSeverityStyle = () => {
    switch (severity) {
      case 'danger':
        return {
          icon: <AlertOctagon className="w-8 h-8 text-red-500" />,
          borderColor: 'border-red-500/40',
          focusRing: 'focus:ring-red-500/50',
          btnClass: 'bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_0_0_#991b1b] hover:shadow-[0_2px_0_0_#991b1b] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none',
          accentColor: 'text-red-500',
          bgHeader: 'bg-red-500/10'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
          borderColor: 'border-yellow-500/40',
          focusRing: 'focus:ring-yellow-500/50',
          btnClass: 'bg-yellow-500 hover:bg-yellow-450 text-slate-950 focus:ring-yellow-400 shadow-[0_4px_0_0_#ca8a04] hover:shadow-[0_2px_0_0_#ca8a04] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none',
          accentColor: 'text-yellow-500',
          bgHeader: 'bg-yellow-500/10'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
          borderColor: 'border-emerald-500/40',
          focusRing: 'focus:ring-emerald-500/50',
          btnClass: 'bg-[#81b64c] hover:bg-[#92ca5a] text-slate-950 shadow-[0_4px_0_0_#5d8a32] hover:shadow-[0_2px_0_0_#5d8a32] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none',
          accentColor: 'text-emerald-450',
          bgHeader: 'bg-emerald-500/10'
        };
      case 'info':
      default:
        return {
          icon: <HelpCircle className="w-8 h-8 text-indigo-400" />,
          borderColor: 'border-indigo-500/40',
          focusRing: 'focus:ring-indigo-500/50',
          btnClass: 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-[0_4px_0_0_#4338ca] hover:shadow-[0_2px_0_0_#4338ca] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none',
          accentColor: 'text-indigo-400',
          bgHeader: 'bg-indigo-500/10'
        };
    }
  };

  const style = getSeverityStyle();
  const balanceRemaining = cost ? Math.max(0, currentBalance - cost.amount) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            id="confirm-dialog-overlay"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`w-full max-w-md bg-[#22211f] rounded-3xl border-2 ${style.borderColor} shadow-2xl overflow-hidden relative z-50`}
            id="confirm-dialog-content"
          >
            {/* Top Close Button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-black/35 text-slate-400 hover:text-white border border-[#3c3934] transition-all cursor-pointer"
              aria-label="Tutup Dialog"
              id="confirm-dialog-close-btn"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Area */}
            <div className={`p-6 pb-4 flex items-start gap-4 ${style.bgHeader}`}>
              <div className="p-3 bg-black/45 rounded-2xl border border-white/10 shrink-0">
                {style.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight leading-snug">
                  {title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 ${style.accentColor}`}>
                    {severity === 'danger' ? 'Riko Tinggi' : severity === 'warning' ? 'Butuh Perhatian' : severity === 'success' ? 'Transaksi Aman' : 'Konfirmasi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                {message}
              </p>

              {/* SPENDING METRICS WRAPPER */}
              {cost && (
                <div className="p-4 bg-black/35 rounded-2xl border border-[#3c3934] space-y-3">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Ringkasan Transaksi Pembelian:
                  </span>
                  
                  <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[11px] text-slate-400 font-semibold">Harga Item:</span>
                    <div className="flex items-center gap-1.5 font-mono font-black text-sm text-yellow-400">
                      {cost.type === 'coin' ? (
                        <>
                          <Coins className="w-4 h-4 text-yellow-500 animate-pulse" />
                          <span>{cost.amount} Koin</span>
                        </>
                      ) : (
                        <>
                          <Gem className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span>{cost.amount} Diamonds</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Balance deduction calculation */}
                  <div className="space-y-1.5 pt-1.5 border-t border-[#3c3934]/60">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-semibold">Sisa Saldo Sekarang:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {currentBalance} {cost.type === 'coin' ? 'Koin' : 'Diamonds'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-red-400">
                      <span className="font-semibold flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" /> Estimasi Pengurangan:
                      </span>
                      <span className="font-mono font-bold">
                        -{cost.amount}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-bold text-emerald-450 bg-[#81b64c]/10 p-1.5 rounded-lg mt-1 border border-[#81b64c]/20">
                      <span className="flex items-center gap-1">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#81b64c]" /> Estimasi Saldo Akhir:
                      </span>
                      <span className="font-mono">
                        {balanceRemaining} {cost.type === 'coin' ? 'Koin' : 'Diamonds'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CRITICAL WARNING TAG FOR PROGRESS ERASE */}
              {severity === 'danger' && (
                <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/10 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-red-300 font-bold leading-normal">
                    Tindakan ini permanen. Seluruh pencapaian, klan membership, stats ELO, history game, setelan skin, dan pembelian item akan dihapus tanpa opsi pemulihan kembali!
                  </span>
                </div>
              )}
            </div>

            {/* Trigger Button Panel */}
            <div className="bg-[#2a2927] p-5 border-t border-[#3c3934] flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 text-slate-300 font-black text-xs uppercase rounded-xl tracking-wider cursor-pointer border border-[#403e3a] transition-all hover:text-white"
                id="confirm-dialog-cancel-btn"
              >
                {cancelText}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                }}
                className={`flex-1 py-3 font-black text-xs uppercase rounded-xl tracking-wider transition-all cursor-pointer ${style.btnClass}`}
                id="confirm-dialog-confirm-btn"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
