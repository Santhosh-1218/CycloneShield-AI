import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';

interface BottomTimelineProps {
  onTimeChange?: (timeStep: { label: string; hourOffset: number }) => void;
  sourceLabel?: string;
}

export const BottomTimeline: React.FC<BottomTimelineProps> = ({
  onTimeChange,
  sourceLabel = 'Open-Meteo Atmospheric Model'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate 12-step timeline from NOW (+0h) to +24h
  const nowHour = new Date().getHours();
  const timeSteps = Array.from({ length: 12 }, (_, i) => {
    if (i === 0) return { label: 'NOW', hourOffset: 0, timeStr: 'LIVE' };
    const h = (nowHour + i * 2) % 24;
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    return {
      label: timeStr,
      hourOffset: i * 2,
      timeStr
    };
  });

  // Autoplay timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % timeSteps.length;
          if (onTimeChange) {
            onTimeChange(timeSteps[next]);
          }
          return next;
        });
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, onTimeChange]);

  const handleSelect = (idx: number) => {
    setCurrentIndex(idx);
    if (onTimeChange) {
      onTimeChange(timeSteps[idx]);
    }
  };

  const handlePrev = () => {
    const prev = (currentIndex - 1 + timeSteps.length) % timeSteps.length;
    handleSelect(prev);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % timeSteps.length;
    handleSelect(next);
  };

  const activeStep = timeSteps[currentIndex];

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3 flex flex-col space-y-2 text-slate-100 select-none">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-bold text-white">Forecast Timeline:</span>
          <span>{activeStep.label}</span>
          {activeStep.hourOffset > 0 && <span className="text-slate-400">(+{activeStep.hourOffset}h)</span>}
        </div>
        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Data Source: <span className="text-slate-200">{sourceLabel}</span>
        </div>
      </div>

      {/* Control Buttons & Scrub Bar */}
      <div className="flex items-center space-x-3">
        {/* Playback Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            title="Previous Step"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/30 transition-all"
            title={isPlaying ? 'Pause' : 'Play Timeline'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            title="Next Step"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline Steps Track */}
        <div className="flex-1 grid grid-cols-6 sm:grid-cols-12 gap-1 overflow-x-auto py-1">
          {timeSteps.map((step, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all border text-center ${
                  isSelected
                    ? 'bg-cyan-600 text-white font-bold border-cyan-400 shadow-md shadow-cyan-600/30 scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/50'
                }`}
              >
                <span className="text-[11px] font-mono leading-none">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
