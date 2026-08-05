import React from 'react';
import { Crown, Sparkles, Flame, Trophy, Snowflake, Waves, Terminal, Zap, Gem, Cpu } from 'lucide-react';
import testMp4Asset from '../assets/images/test.mp4';

interface AvatarWithFrameProps {
  src: string;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isBot?: boolean;
}

interface VideoFrameCanvasProps {
  src: string;
  className?: string;
}

function VideoFrameCanvas({ src, className = '' }: VideoFrameCanvasProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const VIDEO_SOURCES = React.useMemo(() => [
    '/test.mp4',
    testMp4Asset,
    src,
  ].filter(Boolean), [src]);

  const [srcIdx, setSrcIdx] = React.useState(0);
  const currentVideoSrc = '/test.mp4';

  React.useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, [currentVideoSrc]);

  return (
    <div className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10 ${className}`}>
      <video
        ref={videoRef}
        src={currentVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onError={() => {
          setSrcIdx((prev) => (prev + 1) % VIDEO_SOURCES.length);
        }}
        className="w-full h-full object-contain pointer-events-none block z-20 scale-110 rounded-full mix-blend-screen"
      />
    </div>
  );
}

export function AvatarWithFrame({ src, frameId = 'none', size = 'sm', className = '', isBot = false }: AvatarWithFrameProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const currentSize = sizeClasses[size] ? size : 'sm';
  const sizeClass = sizeClasses[currentSize];

  const borderPaddings = {
    xs: 'p-[1.5px]',
    sm: 'p-[2px]',
    md: 'p-[2.5px]',
    lg: 'p-[3px]',
    xl: 'p-[4px]',
  }[currentSize];

  let currentFrame = frameId || 'none';
  if (currentFrame.startsWith('frame_')) {
    currentFrame = currentFrame.replace('frame_', '');
  }

  // MP4 Animated Video Avatar Borders mapping using /test.mp4
  const VIDEO_FRAMES: Record<string, string> = {
    test: '/test.mp4',
    'test.mp4': '/test.mp4',
    '/test.mp4': '/test.mp4',
    data: '/test.mp4',
    'data.mp4': '/test.mp4',
    avatar_border_data: '/test.mp4',
  };

  let videoSrc = VIDEO_FRAMES[currentFrame] || VIDEO_FRAMES[frameId || ''];
  if (!videoSrc) {
    const checkStr = (currentFrame + ' ' + (frameId || '')).toLowerCase();
    if (checkStr.includes('test.mp4')) {
      videoSrc = '/test.mp4';
    }
  }

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
    gold_dragon: 'bg-gradient-to-br from-yellow-500 via-red-600 via-amber-400 to-red-800 border border-yellow-400/50 shadow-2xl shadow-red-500/25 animate-pulse duration-[3000ms]',
  };

  const frameBgClass = frameStyles[currentFrame] || frameStyles['none'];
  const fId = currentFrame;

  // Frame-specific inner photo aperture sizing so profile photo fits perfectly
  const innerPhotoSizes: Record<string, string> = {};
  const photoSizeClass = innerPhotoSizes[fId] || 'w-[80%] h-[80%]';

  const isSpecialPfp = src && (
    src === 'pfp_knight' || 
    src === 'pfp_rook' || 
    src === 'pfp_queen' || 
    src === 'pfp_grandmaster' ||
    src === 'pfp_cyber_samurai' ||
    src === 'pfp_golden_dragon'
  );

  const renderSpecialPfp = () => {
    if (src === 'pfp_knight') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 flex items-center justify-center relative overflow-hidden rounded-full border border-sky-400/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.35),transparent_70%)] animate-pulse" />
          <svg className="w-7 h-7 text-sky-300 relative z-10 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
            <path d="M12 3v3" stroke="currentColor" strokeWidth="2.5" />
            <path d="M10 7h4" stroke="currentColor" strokeWidth="2.5" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    if (src === 'pfp_rook') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 flex items-center justify-center relative overflow-hidden rounded-full border border-emerald-400/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.3),transparent_70%)]" />
          <svg className="w-7 h-7 text-emerald-300 relative z-10 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21h16V9l-3-3H7L4 9v12z" />
            <path d="M9 3v3" />
            <path d="M15 3v3" />
            <path d="M12 3v3" />
            <path d="M10 14h4v7h-4z" fill="currentColor" className="text-emerald-500/40" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    if (src === 'pfp_queen') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-rose-950 via-red-950 to-purple-950 flex items-center justify-center relative overflow-hidden rounded-full border border-rose-500/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(244,63,94,0.4),transparent_70%)] animate-pulse" />
          <svg className="w-7 h-7 text-rose-300 relative z-10 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" fillOpacity="0.2" />
            <path d="M3 20h18" strokeWidth="2.5" />
            <circle cx="12" cy="14" r="2.5" fill="currentColor" className="text-amber-400" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    if (src === 'pfp_grandmaster') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-amber-950 via-yellow-950 to-purple-950 flex items-center justify-center relative overflow-hidden rounded-full border border-amber-400/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_75%)] animate-pulse" />
          <svg className="w-7 h-7 text-yellow-300 relative z-10 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" fill="currentColor" fillOpacity="0.25" />
            <path d="M5 19h14" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-amber-200" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    if (src === 'pfp_cyber_samurai') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-fuchsia-950 via-purple-950 to-indigo-950 flex items-center justify-center relative overflow-hidden rounded-full border border-fuchsia-400/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(217,70,239,0.4),transparent_70%)]" />
          <Zap className="w-7 h-7 text-fuchsia-300 relative z-10 drop-shadow-[0_0_10px_rgba(217,70,239,0.9)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    if (src === 'pfp_golden_dragon') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-red-950 via-amber-950 to-yellow-950 flex items-center justify-center relative overflow-hidden rounded-full border border-amber-500/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.45),transparent_70%)] animate-pulse" />
          <Flame className="w-7 h-7 text-amber-300 relative z-10 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    return null;
  };

  if (videoSrc) {
    return (
      <div className={`relative rounded-full select-none flex items-center justify-center shrink-0 ${sizeClass} ${className}`}>
        {/* Neon Pulsar ambient glow aura ring */}
        <div className="absolute -inset-1 rounded-full bg-cyan-500/30 blur-md animate-pulse pointer-events-none" />

        {/* Video Frame Overlay playing test.mp4 */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10">
          <video
            id="neon-pulsar-video"
            src="/test.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover rounded-full scale-110 filter brightness-110 contrast-125 mix-blend-screen"
            onError={(e) => {
              if (testMp4Asset && e.currentTarget.src !== testMp4Asset) {
                e.currentTarget.src = testMp4Asset;
              }
            }}
          />
        </div>

        {/* Inner Avatar Photo centered inside video frame */}
        <div className="w-full h-full rounded-full bg-[#262421] p-[2px] overflow-hidden flex items-center justify-center relative z-0">
          {isSpecialPfp ? (
            renderSpecialPfp()
          ) : (
            <img
              src={src}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover bg-[#262421] transition-all duration-300 hover:scale-110"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-full select-none flex items-center justify-center shrink-0 ${sizeClass} ${frameBgClass} ${borderPaddings} ${className}`}>
      {/* High-contrast dark offset gap to match premium profile UI rings */}
      <div className="w-full h-full rounded-full bg-[#262421] p-[1px] overflow-hidden flex items-center justify-center relative z-10">
        {isSpecialPfp ? (
          renderSpecialPfp()
        ) : (
          <img
            src={src}
            alt="Avatar"
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-full object-cover bg-[#262421] transition-all duration-300 hover:scale-110"
          />
        )}
      </div>
      {size !== 'xs' && (
        <>
          {fId === 'gold' && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Emas Elite">
              <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'cyber' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 text-slate-950 p-[1.5px] rounded-full border border-cyan-300/80 shadow-[0_0_8px_rgba(6,182,212,0.8)] flex items-center justify-center scale-90 z-20" title="Cyber Neon">
              <Cpu className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'magma' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 text-white p-[1.5px] rounded-full border border-orange-300 shadow-[0_0_8px_rgba(239,68,68,0.8)] flex items-center justify-center scale-90 z-20" title="Magma">
              <Flame className="w-2.5 h-2.5 stroke-[2.5] fill-amber-200/40" />
            </div>
          )}
          {fId === 'cosmic' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white p-[1.5px] rounded-md border border-[#262421] shadow-md flex items-center justify-center scale-95 z-20" title="Kosmik">
              <Trophy className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'golden_ketupat' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-500 text-amber-950 p-[1.5px] rounded-full border border-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.8)] flex items-center justify-center scale-90 z-20" title="Ketupat Emas">
              <svg className="w-2.5 h-2.5 text-amber-950 fill-amber-950/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 12l10 10 10-10L12 2z" />
                <path d="M12 6l-6 6 6 6 6-6-6-6z" />
              </svg>
            </div>
          )}
          {fId === 'red_lantern' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 text-amber-100 p-[1.5px] rounded-full border border-red-300 shadow-[0_0_8px_rgba(225,29,72,0.8)] flex items-center justify-center scale-90 z-20" title="Lentera Merah">
              <svg className="w-2.5 h-2.5 text-amber-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="6" width="10" height="12" rx="2" fill="currentColor" fillOpacity="0.2" />
                <path d="M12 2v4M12 18v4M8 10h8M8 14h8" />
              </svg>
            </div>
          )}
          {fId === 'beach_wave' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-teal-500 via-cyan-400 to-sky-300 text-cyan-950 p-[1.5px] rounded-full border border-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.8)] flex items-center justify-center scale-90 z-20" title="Ombak Pantai">
              <Waves className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'blizzard_winter' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-sky-300 via-cyan-200 to-blue-100 text-cyan-950 p-[1.5px] rounded-full border border-white/90 shadow-[0_0_8px_rgba(186,230,253,0.9)] flex items-center justify-center scale-90 z-20" title="Blizzard Winter">
              <Snowflake className="w-2.5 h-2.5 stroke-[2.5] text-cyan-900" />
            </div>
          )}
          {fId === 'wooden' && (
            <div className="absolute -bottom-1 -right-1 bg-amber-800 text-amber-250 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Kayu Oak">
              <Zap className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'neon_glitch' && (
            <div className="absolute -bottom-1 -right-1 bg-fuchsia-600 text-white p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Glitch">
              <Terminal className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'gold_dragon' && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-white p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Naga Emas">
              <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

