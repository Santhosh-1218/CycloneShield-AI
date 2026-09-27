import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, Navigation } from 'lucide-react';
import { fetchGeocode } from '../../services/api';

interface TopSearchBarProps {
  onSelectLocation: (location: { lat: number; lng: number; name: string; country?: string; admin1?: string }) => void;
  onMyLocationClick?: () => void;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({ onSelectLocation, onMyLocationClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await fetchGeocode(query);
      if (res && res.results) {
        setResults(res.results);
        setIsOpen(true);
      } else {
        setResults([]);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    onSelectLocation({
      lat: item.latitude,
      lng: item.longitude,
      name: item.name,
      country: item.country,
      admin1: item.admin1
    });
    setQuery(item.display_name || item.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Check if input is "lat, lon"
      const coordMatch = query.match(/^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[3]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          onSelectLocation({
            lat,
            lng,
            name: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
            country: 'Custom Coordinates'
          });
          setIsOpen(false);
          return;
        }
      }
      // Otherwise pick top result if available
      if (results && results.length > 0) {
        handleSelect(results[0]);
      }
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-md">
      <div className="relative flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl px-4 py-2.5 transition-all focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
        <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search city, district, state, coordinates (e.g. Kakinada)..."
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        {isLoading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin ml-2 shrink-0" />}

        {query && !isLoading && (
          <button onClick={handleClear} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {onMyLocationClick && (
          <button
            onClick={onMyLocationClick}
            title="Use current location"
            className="p-1.5 ml-2 bg-slate-800 hover:bg-cyan-600/30 text-cyan-400 hover:text-cyan-300 rounded-xl transition-all border border-slate-700"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-800">
          {results.map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => handleSelect(item)}
              className="w-full px-4 py-3 text-left hover:bg-slate-800/80 flex items-start space-x-3 transition-colors group"
            >
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {item.name}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {[item.admin1, item.country].filter(Boolean).join(', ')}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {item.latitude.toFixed(4)}° N, {item.longitude.toFixed(4)}° E
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
