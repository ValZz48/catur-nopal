import React from 'react';
import { Crown, Sparkles, Flame, Trophy, Snowflake, Waves, Terminal, Zap } from 'lucide-react';

interface AvatarWithFrameProps {
  src: string;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isBot?: boolean;
}

export function AvatarWithFrame({ src, frameId = 'none', size = 'sm', className = '', isBot = false }: AvatarWithFrameProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const borderPaddings = {
    xs: 'p-[1.5px]',
    sm: 'p-[2px]',
    md: 'p-[2.5px]',
    lg: 'p-[3px]',
    xl: 'p-[4px]',
  }[size];

  // Professional gradient and aura styling for the frames
  const frameStyles: Record<string, string> = {
    none: isBot 
      ? 'bg-stone-700 border border-stone-600/30 shadow-md' 
      : 'bg-transparent border border-[#3c3934]',
    bronze: 'bg-gradient-to-br from-amber-700 via-amber-500 to-amber-900 border border-amber-600/30 shadow-lg shadow-amber-950/45',
    silver: 'bg-gradient-to-br from-slate-400 via-slate-200 to-slate-500 border border-slate-300/30 shadow-lg shadow-slate-900/35',
    gold: 'bg-gradient-to-br from-yellow-500 via-amber-300 via-yellow-400 to-amber-600 border border-yellow-300/40 shadow-xl shadow-yellow-500/25 animate-pulse duration-[2000ms]',
    cyber: 'bg-gradient-to-br from-cyan-400 via-teal-300 via-cyan-500 to-teal-500 border border-cyan-300/45 shadow-xl shadow-cyan-400/30 animate-pulse duration-[1500ms]',
    magma: 'bg-gradient-to-br from-red-600 via-orange-400 to-rose-700 border border-orange-500/45 shadow-xl shadow-red-500/35',
    cosmic: 'bg-gradient-to-br from-indigo-500 via-purple-500 via-pink-500 via-indigo-600 to-pink-600 border border-fuchsia-400/40 shadow-2xl shadow-purple-500/40 animate-pulse duration-[1800ms]',
    embed_emerald: 'bg-gradient-to-br from-emerald-600 via-teal-400 via-emerald-400 to-teal-700 border border-emerald-400 shadow-xl shadow-emerald-500/35 animate-pulse duration-[2500ms]',
    golden_ketupat: 'bg-gradient-to-br from-yellow-600 via-yellow-400 via-amber-300 to-yellow-600 border border-yellow-400 shadow-xl shadow-yellow-600/25',
    red_lantern: 'bg-gradient-to-br from-red-750 via-rose-500 via-red-600 to-amber-600 border border-red-500/50 shadow-lg shadow-red-950/45 animate-pulse duration-[2200ms]',
    beach_wave: 'bg-gradient-to-br from-sky-500 via-cyan-400 via-sky-300 to-teal-500 border border-sky-400 shadow-lg shadow-sky-400/30',
    blizzard_winter: 'bg-gradient-to-br from-blue-200 via-cyan-150 via-slate-100 to-sky-300 border border-sky-200 shadow-xl shadow-cyan-200/25 animate-pulse duration-[2800ms]',
    wooden: 'bg-gradient-to-br from-amber-800 via-amber-600 via-yellow-700 to-amber-900 border border-amber-800/40 shadow-md shadow-amber-950/50',
    neon_glitch: 'bg-gradient-to-br from-fuchsia-500 via-indigo-600 via-cyan-400 to-purple-800 border border-fuchsia-400 shadow-xl shadow-fuchsia-500/30 animate-pulse duration-[1200ms]',
    gold_dragon: 'bg-gradient-to-br from-yellow-500 via-red-600 via-amber-400 to-red-800 border border-yellow-400/50 shadow-2xl shadow-red-500/25 animate-pulse duration-[3000ms]'
  };

  let currentFrame = frameId || 'none';
  if (currentFrame.startsWith('frame_')) {
    currentFrame = currentFrame.replace('frame_', '');
  }
  const frameBgClass = frameStyles[currentFrame] || frameStyles['none'];
  const fId = currentFrame;

  return (
    <div className={`relative rounded-full select-none flex items-center justify-center shrink-0 ${sizeClasses[size]} ${frameBgClass} ${borderPaddings} ${className}`}>
      {/* High-contrast dark offset gap to match premium profile UI rings */}
      <div className="w-full h-full rounded-full bg-[#262421] p-[1px] overflow-hidden flex items-center justify-center">
        <img
          src={src}
          alt="Avatar"
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover bg-[#262421] transition-all duration-300 hover:scale-110"
        />
      </div>
      {size !== 'xs' && (
        <>
          {fId === 'gold' && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Emas Elite">
              <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'cyber' && (
            <div className="absolute -bottom-1 -right-1 bg-cyan-400 text-slate-900 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Cyber Neon">
              <Sparkles className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'magma' && (
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Magma">
              <Flame className="w-2.5 h-2.5 stroke-[2.5] fill-white/10" />
            </div>
          )}
          {fId === 'cosmic' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white p-[1.5px] rounded-md border border-[#262421] shadow-md flex items-center justify-center scale-95" title="Kosmik">
              <Trophy className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'golden_ketupat' && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-900 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Ketupat Emas">
              <Sparkles className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'red_lantern' && (
            <div className="absolute -bottom-1 -right-1 bg-red-650 text-white p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Lentera Merah">
              <Flame className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'beach_wave' && (
            <div className="absolute -bottom-1 -right-1 bg-sky-400 text-slate-900 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Ombak Pantai">
              <Waves className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'blizzard_winter' && (
            <div className="absolute -bottom-1 -right-1 bg-cyan-100 text-sky-850 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Blizzard Winter">
              <Snowflake className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'wooden' && (
            <div className="absolute -bottom-1 -right-1 bg-amber-800 text-amber-250 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Kayu Oak">
              <Zap className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'neon_glitch' && (
            <div className="absolute -bottom-1 -right-1 bg-fuchsia-600 text-white p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Glitch">
              <Terminal className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'gold_dragon' && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-white p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Naga Emas">
              <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
