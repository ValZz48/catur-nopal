import React from 'react';

interface PieceProps {
  type: string; // 'p' | 'r' | 'n' | 'b' | 'q' | 'k'
  color: string; // 'w' | 'b'
  className?: string;
}

export const ChessPiece: React.FC<PieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';
  
  // Custom styled CSS colors with beautiful shadows and gradients
  const fillClass = isWhite 
    ? 'fill-slate-50 stroke-slate-800' 
    : 'fill-slate-800 stroke-slate-900';
    
  // High contrast elegant minimal custom vector paths for chess pieces
  switch (type.toLowerCase()) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${fillClass}`} strokeWidth="4">
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
          <g filter="url(#shadow)">
            <ellipse cx="50" cy="85" rx="30" ry="8" />
            <path d="M 35 80 L 65 80 L 60 45 L 40 45 Z" />
            <circle cx="50" cy="32" r="16" />
            {isWhite && <circle cx="50" cy="32" r="10" className="fill-white/40 stroke-none" />}
          </g>
        </svg>
      );
    case 'r': // Rook
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${fillClass}`} strokeWidth="4">
          <g>
            <rect x="25" y="80" width="50" height="10" rx="2" />
            <path d="M 30 80 L 70 80 L 65 35 L 35 35 Z" />
            <path d="M 30 35 L 70 35 L 70 20 L 60 20 L 60 27 L 55 27 L 55 20 L 45 20 L 45 27 L 40 27 L 40 20 L 30 20 Z" />
            {isWhite && <rect x="38" y="45" width="24" height="6" rx="1" className="fill-white/30 stroke-none" />}
          </g>
        </svg>
      );
    case 'n': // Knight
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${fillClass}`} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
          <g>
            {/* The classic flat chess knight silhouette */}
            <path d="M 33 80
                     L 67 80
                     C 70 80, 75 75, 71 67
                     C 67 59, 63 55, 68 47
                     C 73 39, 71 27, 63 21
                     C 55 15, 39 12, 33 24
                     C 27 32, 29 44, 29 48
                     C 29 52, 23 54, 21 60
                     C 19 66, 23 72, 29 72
                     C 25 75, 25 78, 33 80 Z" />
            {/* Eye */}
            <circle cx="46" cy="27" r="3" className={isWhite ? 'fill-slate-800' : 'fill-slate-100'} />
            {/* Snout outline */}
            <path d="M 23 44 C 26 40, 31 43, 33 47" fill="none" strokeWidth="2.5" />
            {/* Mane line */}
            <path d="M 54 24 C 58 30, 62 40, 59 50" fill="none" strokeWidth="2.5" />
          </g>
        </svg>
      );
    case 'b': // Bishop
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${fillClass}`} strokeWidth="4">
          <g>
            <ellipse cx="50" cy="85" rx="25" ry="6" />
            <path d="M 33 82 L 67 82 L 60 65 L 40 65 Z" />
            <path d="M 40 65 C 40 65 30 55 35 42 C 40 30 50 22 50 22 C 50 22 60 30 65 42 C 70 55 60 65 60 65 Z" />
            <circle cx="50" cy="18" r="4.5" />
            <path d="M 45 42 H 55 M 50 37 V 47" fill="none" strokeWidth="3" />
            <path d="M 58 35 L 42 50" fill="none" strokeWidth="2" />
          </g>
        </svg>
      );
    case 'q': // Queen
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${fillClass}`} strokeWidth="4">
          <g>
            <ellipse cx="50" cy="85" rx="30" ry="7" />
            <path d="M 30 82 L 70 82 A 5 5 0 0 0 75 75 L 85 40 L 68 62 L 50 30 L 32 62 L 15 40 L 25 75 A 5 5 0 0 0 30 82 Z" />
            <circle cx="15" cy="37" r="4" />
            <circle cx="32" cy="59" r="4" />
            <circle cx="50" cy="26" r="4" />
            <circle cx="68" cy="59" r="4" />
            <circle cx="85" cy="37" r="4" />
          </g>
        </svg>
      );
    case 'k': // King
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${fillClass}`} strokeWidth="4">
          <g>
            <ellipse cx="50" cy="85" rx="30" ry="7" />
            <path d="M 30 82 L 70 82 L 70 70 L 63 60 L 65 40 L 73 35 L 50 48 L 27 35 L 35 40 L 37 60 L 30 70 Z" />
            <path d="M 50 25 V 10 M 43 17 H 57" fill="none" strokeWidth="4.5" />
            <rect x="35" y="70" width="30" height="5" rx="1.5" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};
