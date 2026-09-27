import React, { useState } from 'react';
import { Sparkles, Search, Loader2, X } from 'lucide-react';
import { parseMapQueryIntent } from '../../services/api';

interface NaturalLanguageQueryBarProps {
  onFilterParsed: (intent: {
    intent: string;
    target_type: string;
    risk_level: string;
    summary: string;
  }) => void;
}

export const NaturalLanguageQueryBar: React.FC<NaturalLanguageQueryBarProps> = ({ onFilterParsed }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const parsed = await parseMapQueryIntent(query);
    setLoading(false);

    if (parsed) {
      setActiveFilter(parsed.summary || `Filtered by query`);
      onFilterParsed(parsed);
    }
  };

  const handleClear = () => {
    setQuery('');
    setActiveFilter(null);
    onFilterParsed({
      intent: 'filter_infrastructure',
      target_type: 'all',
      risk_level: 'all',
      summary: 'All map layers active'
    });
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-3.5 text-cyan-400">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Groq AI map intent (e.g., 'Show high risk hospitals near coast')..."
          className="w-full pl-10 pr-24 py-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 shadow-xl transition-all"
        />

        <div className="absolute right-2 flex items-center space-x-1">
          {activeFilter && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs"
              title="Clear Filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg flex items-center transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Search className="w-3.5 h-3.5 mr-1" />}
            Filter
          </button>
        </div>
      </form>

      {activeFilter && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 shadow-md">
            <Sparkles className="w-3 h-3 mr-1 text-cyan-400" />
            Active Filter: {activeFilter}
          </span>
        </div>
      )}
    </div>
  );
};
