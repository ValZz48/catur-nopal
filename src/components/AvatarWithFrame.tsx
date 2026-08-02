import React from 'react';
import { Crown, Sparkles, Flame, Trophy, Snowflake, Waves, Terminal, Zap, Gem } from 'lucide-react';

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
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    let animationFrameId: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Ensure video is playing
    video.play().catch(() => {});

    const render = () => {
      if (video.readyState >= 2) {
        // High resolution 300x300 canvas rendering with high quality image smoothing
        const width = 300;
        const height = 300;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(video, 0, 0, width, height);

        const frame = ctx.getImageData(0, 0, width, height);
        const data = frame.data;

        // Fast flood-fill to isolate white background/hole from the frame/jewels
        const bgMask = new Uint8Array(width * height);
        const queue: number[] = [0, 299, 299 * width, 299 * width + 299, 150 * width + 150];

        let qHead = 0;
        while (qHead < queue.length) {
          const pos = queue[qHead++];
          if (bgMask[pos]) continue;

          const idx = pos * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const minC = Math.min(r, g, b);

          if (minC > 200) {
            bgMask[pos] = 1;
            const x = pos % width;
            const y = (pos / width) | 0;

            if (x > 0 && !bgMask[pos - 1]) queue.push(pos - 1);
            if (x < width - 1 && !bgMask[pos + 1]) queue.push(pos + 1);
            if (y > 0 && !bgMask[pos - width]) queue.push(pos - width);
            if (y < height - 1 && !bgMask[pos + width]) queue.push(pos + width);
          }
        }

        // Apply transparency strictly to background/hole mask, preserving full frame color & opacity
        const total = width * height;
        for (let i = 0; i < total; i++) {
          const idx = i * 4;
          if (bgMask[i]) {
            const minC = Math.min(data[idx], data[idx + 1], data[idx + 2]);
            if (minC > 235) {
              data[idx + 3] = 0;
            } else {
              data[idx + 3] = Math.floor(((235 - minC) / 35) * 255);
            }
          } else {
            // Keep frame jewels, gold, and effects 100% vibrant & opaque!
            data[idx + 3] = 255;
          }
        }

        ctx.putImageData(frame, 0, 0);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="hidden"
        onError={(e) => {
          const v = e.currentTarget;
          if (!v.dataset.tried1) {
            v.dataset.tried1 = 'true';
            v.src = '/test.mp4';
            v.load();
            v.play().catch(() => {});
          } else if (!v.dataset.tried2) {
            v.dataset.tried2 = 'true';
            v.src = '/frames/test.mp4';
            v.load();
            v.play().catch(() => {});
          } else if (!v.dataset.tried3) {
            v.dataset.tried3 = 'true';
            v.src = '/frames/avatar_border_test.mp4';
            v.load();
            v.play().catch(() => {});
          }
        }}
      />
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className={className}
      />
    </>
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

  // MP4 Animated Video Avatar Borders mapping using test.mp4
  const VIDEO_FRAMES: Record<string, string> = {
    avatar_border_test: '/test.mp4',
    test: '/test.mp4',
    'test.mp4': '/test.mp4',
    neon_pulsar: '/test.mp4',
    'Neon Pulsar': '/test.mp4',
    data: '/test.mp4',
    'data.mp4': '/test.mp4',
    avatar_border_data: '/test.mp4',
  };

  const videoSrc = VIDEO_FRAMES[currentFrame];

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
    avatar_border_test: 'bg-cyan-950/40 border border-cyan-400/40 shadow-lg shadow-cyan-500/30',
  };

  const frameBgClass = frameStyles[currentFrame] || frameStyles['none'];
  const fId = currentFrame;

  // Frame-specific inner photo aperture sizing so profile photo fits perfectly
  const innerPhotoSizes: Record<string, string> = {
    avatar_border_test: 'w-[82%] h-[82%]',
  };
  const photoSizeClass = innerPhotoSizes[fId] || 'w-[80%] h-[80%]';

  const isSpecialPfp = src && (
    src === 'pfp_knight' || 
    src === 'pfp_rook' || 
    src === 'pfp_queen' || 
    src === 'pfp_grandmaster'
  );

  const renderSpecialPfp = () => {
    if (src === 'pfp_knight') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden rounded-full">
          <svg className="w-7 h-7 text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21V19C19 16.5 17 14.5 14.5 14.5H9.5C7 14.5 5 16.5 5 19V21" />
            <path d="M12 14V11.5" />
            <path d="M12 9.5c0-1.5 1-2.5 2-3s2-2 2-3.5c-0.5 1-1.5 1.5-2.5 1.5s-2.5-1-3.5-1.5c-1 0.5-2 1.5-2 3s1 2.5 2 3.5v2.5" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    if (src === 'pfp_rook') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 flex items-center justify-center relative overflow-hidden rounded-full">
          <svg className="w-7 h-7 text-emerald-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21V9l3-3h10l3 3v12" />
            <path d="M4 9h16" />
            <path d="M7 6V4h2v2" />
            <path d="M11 6V4h2v2" />
            <path d="M15 6V4h2v2" />
            <path d="M10 14h4v7h-4z" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    if (src === 'pfp_queen') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#880d1e] via-[#4f000b] to-[#1a0003] flex items-center justify-center relative overflow-hidden rounded-full">
          <svg className="w-7 h-7 text-rose-300 drop-shadow-[0_2px_5px_rgba(244,63,94,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
            <path d="M3 20h18" />
            <circle cx="12" cy="14" r="2" fill="currentColor" className="text-rose-500" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    if (src === 'pfp_grandmaster') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 flex items-center justify-center relative overflow-hidden rounded-full">
          <svg className="w-7 h-7 text-yellow-300 drop-shadow-[0_2px_6px_rgba(234,179,8,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            <circle cx="12" cy="11" r="1.5" fill="currentColor" className="text-yellow-400" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>
      );
    }
    return null;
  };

  if (videoSrc) {
    return (
      <div className={`relative select-none flex items-center justify-center shrink-0 ${sizeClass} ${className}`}>
        {/* Inner Avatar Photo centered inside video frame inner aperture */}
        <div className={`${photoSizeClass} rounded-full overflow-hidden flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 bg-[#262421] shadow-inner`}>
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

        {/* Animated Video Frame Canvas Overlay (enlarged and thickened for Neon Pulsar) */}
        <VideoFrameCanvas
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 scale-120 transform origin-center transition-transform"
        />
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
            <div className="absolute -bottom-1 -right-1 bg-cyan-400 text-slate-900 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Cyber Neon">
              <Sparkles className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'magma' && (
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Magma">
              <Flame className="w-2.5 h-2.5 stroke-[2.5] fill-white/10" />
            </div>
          )}
          {fId === 'cosmic' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white p-[1.5px] rounded-md border border-[#262421] shadow-md flex items-center justify-center scale-95 z-20" title="Kosmik">
              <Trophy className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'golden_ketupat' && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-900 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Ketupat Emas">
              <Sparkles className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'red_lantern' && (
            <div className="absolute -bottom-1 -right-1 bg-red-650 text-white p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Lentera Merah">
              <Flame className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'beach_wave' && (
            <div className="absolute -bottom-1 -right-1 bg-sky-400 text-slate-900 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Ombak Pantai">
              <Waves className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'blizzard_winter' && (
            <div className="absolute -bottom-1 -right-1 bg-cyan-100 text-sky-850 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90 z-20" title="Blizzard Winter">
              <Snowflake className="w-2.5 h-2.5 stroke-[2.5]" />
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

