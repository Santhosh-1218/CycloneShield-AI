import { Bell, X, Navigation } from 'lucide-react';

interface AlertsOverlayPanelProps {
  onCenterLocation: (lat: number, lng: number, name: string) => void;
  onClose: () => void;
}

export const AlertsOverlayPanel: React.FC<AlertsOverlayPanelProps> = ({
  onCenterLocation,
  onClose
}) => {
  const activeAlerts = [
    {
      id: 'alt-1',
      severity: 'CRITICAL',
      badge: 'bg-red-500/20 text-red-400 border-red-500/40',
      title: 'Coastal Zone A - High Flood & Surge Exposure',
      time: '15 mins ago',
      locationName: 'Kakinada Port Corridor',
      coords: [16.9891, 82.2475],
      details: 'High vulnerability score due to low elevation coastal terrain & severe storm surge level.'
    },
    {
      id: 'alt-2',
      severity: 'HIGH',
      badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      title: 'Zone B - Hospital Evacuation Access Risk',
      time: '42 mins ago',
      locationName: 'Visakhapatnam Harbor Sector',
      coords: [17.6868, 83.2185],
      details: 'Evacuation corridors & primary hospital road access routes susceptible to inundation.'
    },
    {
      id: 'alt-3',
      severity: 'MEDIUM',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      title: 'Zone C - Heavy Rainfall Accumulation Warning',
      time: '2 hours ago',
      locationName: 'Machilipatnam Sector',
      coords: [16.1800, 81.1300],
      details: 'Accumulated 24-hour rainfall expected to reach 220mm; localized urban drainage overload.'
    }
  ];

  return (
    <div className="w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 flex flex-col space-y-3 z-40 select-none max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Bell className="w-4 h-4" />
          <span>Real-Time Alerts & Directives</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Active emergency weather bulletins, coastal flood warnings, and critical infrastructure directives.
      </p>

      {/* Alert Cards */}
      <div className="space-y-2.5">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 text-xs transition-all"
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${alert.badge}`}>
                {alert.severity}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{alert.time}</span>
            </div>

            <div className="font-bold text-white text-xs leading-snug">
              {alert.title}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {alert.details}
            </p>

            <button
              onClick={() => onCenterLocation(alert.coords[0], alert.coords[1], alert.locationName)}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-cyan-600/30 hover:border-cyan-500/50 border border-slate-700 text-slate-300 hover:text-cyan-300 font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-all mt-1"
            >
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>Zoom to Alert Area</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
