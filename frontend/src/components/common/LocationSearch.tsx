import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X } from 'lucide-react';
import { useLocation, type GeocodeResult } from '../../context/LocationContext';

interface LocationSearchProps {
  className?: string;
  placeholder?: string;
  compact?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  className = '',
  placeholder = 'Search city, district, or coordinates...',
  compact = false,
}) => {
  const { searchLocation, selectLocation, requestLiveLocation, isGeolocating, locationError } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchLocation(query);
      setResults(res);
      setIsSearching(false);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: GeocodeResult) => {
    selectLocation(item);
    setQuery('');
    setIsOpen(false);
  };

  const handleUseMyLocation = async () => {
    await requestLiveLocation();
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-[#888888] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          className={`w-full pl-10 pr-24 py-2 bg-white text-[#111111] placeholder-[#888888] border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all shadow-xs ${
            compact ? 'py-1.5 text-xs pl-8 pr-20' : ''
          }`}
        />

        {query ? (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-20 text-[#888888] hover:text-[#111111] p-1 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}

        <button
          onClick={handleUseMyLocation}
          disabled={isGeolocating}
          title="Use My Location"
          className="absolute right-1.5 flex items-center gap-1 text-xs font-medium text-[#16A34A] hover:text-[#15803D] hover:bg-[#F0FDF4] px-2 py-1 rounded-lg border border-[#BBF7D0] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Navigation className={`h-3 w-3 ${isGeolocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isGeolocating ? 'Locating...' : 'Near Me'}</span>
        </button>
      </div>

      {locationError && (
        <p className="mt-1 text-xs text-[#DC2626] font-medium px-1">{locationError}</p>
      )}

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#E5E5E5] rounded-xl shadow-lg max-h-72 overflow-y-auto py-1">
          <div className="px-3 py-1.5 border-b border-[#F1F5F9] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider">Locations</span>
            <button
              onClick={handleUseMyLocation}
              className="text-xs text-[#16A34A] hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <Navigation className="h-3 w-3" />
              Use Current GPS Location
            </button>
          </div>

          {isSearching ? (
            <div className="p-4 text-center text-xs text-[#666666]">
              Searching locations...
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8FAFC] flex items-start gap-2.5 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
              >
                <MapPin className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-[#111111]">{item.name}</div>
                  <div className="text-xs text-[#666666] line-clamp-1">{item.display_name}</div>
                </div>
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-xs text-[#666666]">
              No locations found for "{query}". Try a city or district name.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
