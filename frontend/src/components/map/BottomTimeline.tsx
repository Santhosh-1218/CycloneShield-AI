import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';

interface BottomTimelineProps {
  onTimeChange?: (timeStep: { label: string; hourOffset: number }) => void;
  hourlyForecast?: any[];
  sourceLabel?: string;
}

function getWeatherConditionLabel(point: any): string | null {
  if (!point) return null;
  const code = point.weatherCode;
  if (code !== undefined && code !== null) {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Cloudy';
    if (code >= 95) return 'Storm';
    if (code >= 80) return 'Showers';
    if (code >= 50 && code < 70) return 'Rain';
  }
  if (point.precipitation && point.precipitation > 0.2) return 'Rain';
  if (point.windSpeed && point.windSpeed > 25) return `${Math.round(point.windSpeed)} km/h`;
  return null;
}

export const BottomTimeline: React.FC<BottomTimelineProps> = ({
  onTimeChange,
  hourlyForecast = [],
  sourceLabel = 'Open-Meteo & IMD Numerical Forecast'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Key milestone timeline steps per design specs: NOW, +3h, +6h, +12h, +18h, +24h
  const offsets = [0, 3, 6, 12, 18, 24];
  const timeSteps = offsets.map((offset) => {
    const forecastPoint = Array.isArray(hourlyForecast) && hourlyForecast.length > offset 
      ? hourlyForecast[offset] 
      : null;

    const temp = forecastPoint?.temperature !== undefined && forecastPoint?.temperature !== null
      ? `${Math.round(forecastPoint.temperature)}°C`
      : null;

    const condition = getWeatherConditionLabel(forecastPoint);
    const wind = forecastPoint?.windSpeed ? `Wind ${Math.round(forecastPoint.windSpeed)} km/h` : null;
    const label = offset === 0 ? 'NOW' : `+${offset}h`;

    return {
      label,
      hourOffset: offset,
      temp,
      condition,
      wind,
      timeStr: forecastPoint?.time || label
    };
  });

  // Autoplay timer with cleanup
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
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, onTimeChange, timeSteps]);

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
    <div className="w-full bg-white/95 backdrop-blur-md border border-[#E5E5E5] rounded-xl shadow-lg p-2.5 sm:p-3 flex flex-col space-y-2 text-[#111111] select-none">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center space-x-2 text-[#16A34A] font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-bold text-[#111111] font-mono uppercase tracking-wider text-[11px]">Forecast Timeline:</span>
          <span className="font-bold text-[#16A34A] font-mono text-[11px]">{activeStep.label}</span>
          {activeStep.hourOffset > 0 && <span className="text-[#888888] text-[10px] hidden sm:inline">({activeStep.hourOffset}h projection)</span>}
        </div>
        
        {/* Model Attribution - Visually Quiet */}
        <div className="text-[10px] text-[#888888] font-mono tracking-tight hidden md:flex items-center gap-1">
          <span className="uppercase text-[#AAAAAA] text-[9px]">Model</span>
          <span className="text-[#666666] font-medium">{sourceLabel}</span>
        </div>
      </div>

      {/* Control Buttons & Connected Timeline Track */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Playback Controls */}
        <div className="flex items-center space-x-1 shrink-0 justify-between sm:justify-start">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#E5E5E5] text-[#666666] hover:text-[#111111] border border-[#E5E5E5] transition-all cursor-pointer"
            title="Previous Forecast Step"
            aria-label="Previous Forecast Step"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : 'bg-[#16A34A] hover:bg-[#15803D]'
            }`}
            title={isPlaying ? 'Pause Timeline Playback' : 'Start Timeline Playback'}
            aria-label={isPlaying ? 'Pause Playback' : 'Start Playback'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-mono text-[11px] tracking-wider">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px] tracking-wider">PLAY</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#E5E5E5] text-[#666666] hover:text-[#111111] border border-[#E5E5E5] transition-all cursor-pointer"
            title="Next Forecast Step"
            aria-label="Next Forecast Step"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Connected Timeline Track with Continuous Baseline */}
        <div className="relative flex-1 py-1">
          {/* Subtle connecting timeline line behind cards */}
          <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-[2px] bg-[#E2E8F0] z-0 hidden sm:block" />

          {/* Forecast Cards Grid */}
          <div className="relative z-10 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {timeSteps.map((step, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all border text-center cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#16A34A] text-white font-bold border-[#15803D] shadow-md -translate-y-0.5 ring-2 ring-[#16A34A]/20'
                      : 'bg-white/90 hover:bg-white text-[#666666] hover:text-[#111111] border-[#E5E5E5] shadow-xs'
                  }`}
                >
                  {/* Timeline milestone node indicator */}
                  <div className={`w-1.5 h-1.5 rounded-full mb-1 transition-colors ${
                    isSelected ? 'bg-white' : 'bg-[#94A3B8]'
                  }`} />

                  <span className="text-[11px] font-bold font-mono leading-none tracking-tight">
                    {step.label}
                  </span>

                  {step.temp && (
                    <span className={`text-[10px] mt-0.5 font-mono leading-none ${
                      isSelected ? 'text-white font-extrabold' : 'text-[#111111] font-semibold'
                    }`}>
                      {step.temp}
                    </span>
                  )}

                  {step.condition && (
                    <span className={`text-[9px] mt-0.5 leading-none truncate max-w-full px-1 ${
                      isSelected ? 'text-white/90 font-medium' : 'text-[#888888]'
                    }`}>
                      {step.condition}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
