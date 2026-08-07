import React from 'react';
import { Trophy, Sparkles, Coins, Gem, ArrowRight, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export interface SeasonResetDetails {
  prevSeasonCode: string;
  newSeasonCode: string;
  newSeasonName: string;
  finalElo: number;
  finalRankName: string;
  newElo: number;
  rewardCoins: number;
  rewardDiamonds: number;
}

interface SeasonResetRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: SeasonResetDetails | null;
  prefLang: 'id' | 'en';
}

export const SeasonResetRewardModal: React.FC<SeasonResetRewardModalProps> = ({
  isOpen,
  onClose,
  details,
  prefLang
}) => {
  if (!isOpen || !details) return null;

  const isEng = prefLang === 'en';

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#1e1c1b] border-2 border-[#81b64c]/60 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative my-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8 text-[#81b64c]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30 px-3 py-1 rounded-full inline-block">
              {isEng ? 'Global Season Reset (3 Months)' : 'Reset Musim Global (3 Bulan)'}
            </span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mt-2">
              {isEng ? 'Welcome to the New Season!' : 'Selamat Datang di Musim Baru!'}
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1">
              {isEng
                ? `Season ${details.prevSeasonCode} has officially concluded. Welcome to ${details.newSeasonName}!`
                : `Musim ${details.prevSeasonCode} telah resmi berakhir. Selamat datang di ${details.newSeasonName}!`}
            </p>
          </div>
        </div>

        {/* Previous Rank & Season Performance Summary */}
        <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] space-y-3">
          <div className="flex items-center justify-between border-b border-[#3c3934] pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isEng ? 'Final Rank Last Season' : 'Pangkat Akhir Musim Lalu'}
              </span>
              <span className="text-sm font-black text-amber-400">
                {details.finalRankName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isEng ? 'Final ELO Score' : 'Skor ELO Akhir'}
              </span>
              <span className="text-sm font-mono font-black text-white">
                {details.finalElo} ELO
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <RefreshCw className="w-4 h-4 text-[#81b64c]" />
              <span>{isEng ? 'Soft ELO Reset for New Season:' : 'Penataan Ulang ELO Musim Baru:'}</span>
            </div>
            <span className="text-xs font-mono font-black text-[#81b64c]">
              {details.newElo} ELO
            </span>
          </div>
        </div>

        {/* Season Rewards Earned */}
        <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] space-y-3">
          <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isEng ? 'Season Honor Rewards Earned' : 'Bonus Hadiah Kehormatan Season'}</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1c1a19] p-3 rounded-xl border border-[#3c3934] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">{isEng ? 'Bonus Coins' : 'Bonus Koin'}</span>
                <span className="text-sm font-black text-amber-400 font-mono">+{details.rewardCoins}</span>
              </div>
            </div>

            <div className="bg-[#1c1a19] p-3 rounded-xl border border-[#3c3934] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Gem className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">{isEng ? 'Bonus Diamonds' : 'Bonus Berlian'}</span>
                <span className="text-sm font-black text-cyan-400 font-mono">+{details.rewardDiamonds}</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#1c1a19] border border-[#3c3934] rounded-xl flex items-center gap-2 text-[11px] text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#81b64c] shrink-0" />
            <span>
              {isEng
                ? 'Season Pass levels have been fresh-reset for all players globally!'
                : 'Level Season Pass telah ditata ulang dari awal secara serentak untuk seluruh pemain!'}
            </span>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-[#81b64c] hover:bg-[#6c9c3e] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-[#81b64c]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{isEng ? 'Claim Rewards & Enter Arena' : 'Klaim Hadiah & Masuk Arena'}</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>

      </div>
    </div>
  );
};
