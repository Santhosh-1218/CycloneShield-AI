import React from 'react';
import { FileText, Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const reports = [
    {
      id: 'REP-2026-0925-01',
      title: 'District Disaster Vulnerability Briefing - Kakinada Coastal Zone',
      date: '25 Sep 2026',
      riskScore: '82 / 100 (CRITICAL)',
      type: 'Automated AI Executive Summary',
      status: 'Generated'
    },
    {
      id: 'REP-2026-0924-02',
      title: 'Infrastructure Exposure Assessment - Visakhapatnam & Kakinada Hospitals',
      date: '24 Sep 2026',
      riskScore: '74 / 100 (HIGH)',
      type: 'OSM Asset Exposure Report',
      status: 'Generated'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      <div className="flex items-center space-x-2">
        <FileText className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white tracking-tight">Generated Disaster Risk Reports & Dossiers</h1>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-cyan-400 font-bold">{r.id} • {r.date}</span>
              <h3 className="font-bold text-base text-white">{r.title}</h3>
              <p className="text-xs text-slate-400">{r.type} • Risk Index: <span className="text-red-400 font-bold">{r.riskScore}</span></p>
            </div>

            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center space-x-2 transition-all">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export PDF / JSON</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
