import React from 'react';
import { Database, RefreshCw } from 'lucide-react';

export interface DataSourceItem {
  id: string;
  name: string;
  type: string;
  provider: string;
  purpose: string;
  status: 'Available' | 'Unavailable' | 'Configured' | 'Key Required' | string;
  lastUpdated: string;
  freshness: string;
  license?: string;
}

interface DataSourcePanelProps {
  sources: DataSourceItem[];
  loading?: boolean;
}

export const DataSourcePanel: React.FC<DataSourcePanelProps> = ({ sources, loading }) => {
  if (loading) {
    return (
      <div className="bg-navy-800/90 border border-slate-700/80 rounded-2xl p-6 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-shield-accent mx-auto mb-2" />
        <span className="text-xs font-mono">Querying Data Pipeline Sources...</span>
      </div>
    );
  }

  return (
    <div className="bg-navy-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-shield-accent" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live System Data Pipeline Status</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Phase 2 Real-Data Verification</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sources.map((source) => {
          const isOk = source.status === 'Available' || source.status === 'Configured';

          return (
            <div
              key={source.id}
              className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white truncate max-w-[180px]">{source.name}</span>
                  <span
                    className={`
                      px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0
                      ${isOk 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}
                    `}
                  >
                    {source.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight mb-2">{source.purpose}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="text-slate-300 truncate max-w-[130px]">{source.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span>Freshness:</span>
                  <span className="text-emerald-400 truncate max-w-[130px]">{source.freshness}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
