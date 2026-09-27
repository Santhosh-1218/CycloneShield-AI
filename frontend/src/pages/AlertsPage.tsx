import React, { useState } from 'react';
import { Bell, ChevronRight, Plus } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Active Alerts' | 'Alert History'>('Active Alerts');

  const alerts = [
    {
      id: 'alt-1',
      severity: 'CRITICAL',
      badgeColor: 'bg-red-100 text-red-600 border-red-200',
      title: 'Coastal Zone A - High flood exposure',
      time: '2 hours ago',
      details: 'High vulnerability score due to low elevation coastal terrain & severe storm surge level.'
    },
    {
      id: 'alt-2',
      severity: 'HIGH',
      badgeColor: 'bg-orange-100 text-orange-600 border-orange-200',
      title: 'Zone B - Road accessibility risk',
      time: '3 hours ago',
      details: 'Evacuation corridors & primary hospital road access routes susceptible to inundation.'
    },
    {
      id: 'alt-3',
      severity: 'MEDIUM',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      title: 'Zone C - Heavy rainfall exposure',
      time: '5 hours ago',
      details: 'Accumulated 24-hour rainfall expected to reach 220mm; localized urban drainage overload.'
    }
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Header matching Mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Alerts & Action Center</h1>
          <p className="text-xs text-slate-500">Manage alerts and generate notifications</p>
        </div>

        <button
          onClick={() => alert("Generate Alert triggered. Dispatching notification to response teams.")}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Alert</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit text-xs">
        {(['Active Alerts', 'Alert History'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alert List Cards matching Mockup */}
      <div className="space-y-3">
        {alerts.map((alertItem) => (
          <div
            key={alertItem.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${alertItem.badgeColor}`}>
                    {alertItem.severity}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{alertItem.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{alertItem.details}</p>
                <div className="text-[11px] text-slate-400 font-medium pt-0.5">{alertItem.time}</div>
              </div>
            </div>

            <button className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 self-end sm:self-center shrink-0">
              <span>View</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

