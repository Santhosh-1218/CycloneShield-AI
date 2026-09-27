import React from 'react';
import { ShieldAlert, Globe, Radio, Building2, Bot } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-slate-100">
      <div className="space-y-3 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">CycloneShield AI Platform</h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm leading-relaxed">
          AI-powered real-time cyclone, flood, weather, infrastructure vulnerability, and disaster-risk monitoring platform for coastal regions, especially the Bay of Bengal and APAC.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Radio className="w-4 h-4" />
            <span>Open-Meteo High Resolution Weather</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Real-time surface temperature, relative humidity, 24-hour precipitation accumulation, wind velocity vectors, surface pressure, and 7-day hourly forecasts.
          </p>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <Globe className="w-4 h-4" />
            <span>Google Earth Engine & Satellite Data</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Copernicus Sentinel-1 Synthetic Aperture Radar (SAR) all-weather inundation indicators, NASADEM 30m elevation terrain grids, CHIRPS rainfall grids, and Dynamic World land cover.
          </p>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <Building2 className="w-4 h-4" />
            <span>OpenStreetMap Overpass Infrastructure</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Real-time spatial queries for hospitals, evacuation cyclone shelters, schools, primary roads, causeways, and critical bridges in hazard zones.
          </p>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
            <Bot className="w-4 h-4" />
            <span>Transparent Risk Engine & AI Copilot</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Formulaic numerical calculation combining Hazard, Exposure, and Vulnerability. Groq / Gemini AI explains risk drivers using data without hallucinating values.
          </p>
        </div>
      </div>
    </div>
  );
};
