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
    const rawLat = item.lat ?? item.latitude;
    const rawLng = item.lon ?? item.lng ?? item.longitude;
    const lat = typeof rawLat === 'number' ? rawLat : parseFloat(rawLat);
    const lng = typeof rawLng === 'number' ? rawLng : parseFloat(rawLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      onSelectLocation({
        lat,
        lng,
        name: item.name || item.display_name?.split(',')[0] || 'Selected Location',
        country: item.country || '',
        admin1: item.state || item.admin1 || item.district || ''
      });
      setQuery(item.display_name || item.name || '');
    }
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
    <div ref={dropdownRef} className="relative w-full max-w-sm sm:max-w-md transition-all duration-300 ease-out focus-within:max-w-lg">
      <div className="relative flex items-center bg-white/95 backdrop-blur-md border border-[#E5E5E5] rounded-xl shadow-xs px-3 py-1.5 transition-all duration-200 focus-within:border-[#16A34A] focus-within:ring-2 focus-within:ring-[#16A34A]/15 focus-within:shadow-md">
        <Search className="w-3.5 h-3.5 text-[#888888] mr-2 shrink-0" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search city, district or location..."
          className="w-full bg-transparent text-xs text-[#111111] placeholder-[#888888] focus:outline-none"
        />

        {isLoading && <Loader2 className="w-3.5 h-3.5 text-[#16A34A] animate-spin ml-1.5 shrink-0" />}

        {query && !isLoading && (
          <button 
            onClick={handleClear} 
            className="p-1 hover:bg-[#F8FAFC] rounded-md text-[#888888] hover:text-[#111111] transition-all ml-1 cursor-pointer"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {onMyLocationClick && (
          <button
            onClick={onMyLocationClick}
            title="Locate via GPS"
            className="p-1 ml-1 text-[#16A34A] hover:bg-[#F0FDF4] rounded-lg transition-colors border border-transparent hover:border-[#BBF7D0] cursor-pointer shrink-0"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/98 backdrop-blur-md border border-[#E5E5E5] rounded-xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
          {results.map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => handleSelect(item)}
              className="w-full px-3 py-2 text-left hover:bg-[#F8FAFC] flex items-start space-x-2.5 transition-colors group cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] group-hover:bg-[#DCFCE7] transition-colors mt-0.5 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#111111] group-hover:text-[#16A34A] transition-colors truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-[#666666] truncate">
                  {[item.admin1, item.country].filter(Boolean).join(', ')}
                </div>
                <div className="text-[10px] text-[#888888] font-mono mt-0.5">
                  {typeof (item.lat ?? item.latitude) === 'number' ? (item.lat ?? item.latitude).toFixed(3) : parseFloat(String(item.lat ?? item.latitude ?? 0)).toFixed(3)}° N, {typeof (item.lon ?? item.lng ?? item.longitude) === 'number' ? (item.lon ?? item.lng ?? item.longitude).toFixed(3) : parseFloat(String(item.lon ?? item.lng ?? item.longitude ?? 0)).toFixed(3)}° E
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
