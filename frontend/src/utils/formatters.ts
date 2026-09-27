import type { RiskLevel } from '../types';

export function getRiskColorClass(level: RiskLevel): string {
  switch (level) {
    case 'Low':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'High':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'Critical':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'Low':
      return 'bg-emerald-500 text-slate-950 font-bold';
    case 'Medium':
      return 'bg-amber-500 text-slate-950 font-bold';
    case 'High':
      return 'bg-orange-500 text-white font-bold';
    case 'Critical':
      return 'bg-red-600 text-white font-bold animate-pulse';
    default:
      return 'bg-slate-600 text-white';
  }
}

export function formatCoordinate(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) return 'Location Not Set';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}
