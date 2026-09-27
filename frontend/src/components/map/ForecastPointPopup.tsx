import React from 'react';
import type { CycloneForecastPoint } from '../../services/api';

interface ForecastPointPopupProps {
  point: CycloneForecastPoint;
  stormName: string;
  onClose: () => void;
}

const ForecastPointPopup: React.FC<ForecastPointPopupProps> = ({
  point,
  stormName,
  onClose
}) => {
  const [lon, lat] = point.coordinates;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 p-3.5 rounded-xl shadow-2xl w-64 text-white text-xs select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px]">
            FORECAST POSITION ({point.timeLabel || `+${point.offsetHours}h`})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white bg-slate-800 p-1 rounded-full transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-400">Storm:</span>
          <span className="font-bold text-slate-200">{stormName}</span>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Coordinates:</span>
          <span className="text-cyan-300 font-semibold">{lat.toFixed(2)}°N, {lon.toFixed(2)}°E</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Exp. Wind:</span>
          <span className="font-extrabold text-amber-400 font-mono">
            {point.windSpeedKmh ? `${point.windSpeedKmh} km/h` : 'Not available'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Exp. Pressure:</span>
          <span className="font-extrabold text-cyan-400 font-mono">
            {point.pressureHpa ? `${point.pressureHpa} hPa` : 'Not available'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForecastPointPopup;
