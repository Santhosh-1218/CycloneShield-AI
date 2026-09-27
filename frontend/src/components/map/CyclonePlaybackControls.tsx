import React from 'react';

interface CyclonePlaybackControlsProps {
  isPlaying: boolean;
  playbackSpeed: number; // 0.5, 1, 2, 4
  onTogglePlay: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: number) => void;
}

const CyclonePlaybackControls: React.FC<CyclonePlaybackControlsProps> = ({
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onReset,
  onChangeSpeed
}) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 px-3 py-1.5 rounded-full shadow-2xl flex items-center space-x-2.5 text-white select-none transition-all">
      {/* Track Label Badge */}
      <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/60 text-[10px] font-mono tracking-wider text-slate-300">
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
        <span className="font-bold uppercase">Track Playback</span>
      </div>

      {/* Play / Pause Toggle */}
      <button
        onClick={onTogglePlay}
        className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 transition-all transform active:scale-95 ${
          isPlaying
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/30'
        }`}
        title={isPlaying ? 'Pause Track Playback' : 'Play Track Interpolation'}
      >
        {isPlaying ? (
          <>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            <span>PAUSE</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>PLAY TRACK</span>
          </>
        )}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="p-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/50 transition-all active:scale-95"
        title="Reset to NOW"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Speed Selector */}
      <div className="flex items-center bg-slate-950/90 p-0.5 rounded-full border border-slate-700/80 text-[10px] font-mono">
        {[0.5, 1, 2, 4].map((spd) => (
          <button
            key={spd}
            onClick={() => onChangeSpeed(spd)}
            className={`px-2 py-0.5 rounded-full font-bold transition-all ${
              playbackSpeed === spd
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {spd}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default CyclonePlaybackControls;
