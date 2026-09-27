import React from 'react';
import { MapPin, Navigation, X, ShieldAlert } from 'lucide-react';
import { useUserLocation } from '../../hooks/useUserLocation';

export const LocationModal: React.FC = () => {
  const { 
    location, 
    requestLocation, 
    skipLocation, 
    showLocationModal, 
    setShowLocationModal 
  } = useUserLocation();

  if (!showLocationModal) return null;

  const isRequesting = location.status === 'requesting';

  const handleAllowLocation = async () => {
    await requestLocation();
  };

  const handleSkip = () => {
    skipLocation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-navy-800 border border-slate-700/60 shadow-2xl p-6 sm:p-8 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowLocationModal(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <MapPin className="w-7 h-7" />
          </div>
        </div>

        <div className="text-center">
          <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 uppercase">
            Localized Risk Assessment
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
            Enable Location
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Use your current location to show localized cyclone risk, weather information and nearby infrastructure.
          </p>

          {location.status === 'denied' && location.errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{location.errorMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleAllowLocation}
              disabled={isRequesting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Navigation className={`w-5 h-5 ${isRequesting ? 'animate-spin' : ''}`} />
              <span>{isRequesting ? 'Acquiring Coordinates...' : 'Allow Location'}</span>
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-colors border border-slate-700"
            >
              Skip for now
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-500">
            One-time browser permission. Location is never continuously tracked or stored externally.
          </div>
        </div>
      </div>
    </div>
  );
};
