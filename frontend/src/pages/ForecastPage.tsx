import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Droplets, Thermometer, Calendar } from 'lucide-react';
import { fetchCurrentWeather, fetchHourlyWeather } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ForecastPage: React.FC = () => {
  const [current, setCurrent] = useState<any>(null);
  const [hourly, setHourly] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [c, h] = await Promise.all([
        fetchCurrentWeather(16.9891, 82.2475),
        fetchHourlyWeather(16.9891, 82.2475)
      ]);
      setCurrent(c);
      setHourly(h?.hourly || []);
    }
    load();
  }, []);

  const vals = current?.values || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      <div className="flex items-center space-x-2">
        <CloudRain className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white tracking-tight">Meteorological Weather & Atmospheric Forecast</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <Thermometer className="w-8 h-8 text-amber-400" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">Temperature</span>
            <div className="text-2xl font-bold text-white">{vals.temperature ?? 29}°C</div>
            <span className="text-xs text-slate-500">Feels like {vals.feelsLike ?? 30.5}°C</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <Wind className="w-8 h-8 text-cyan-400" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">Wind Velocity</span>
            <div className="text-2xl font-bold text-white">{vals.windSpeed ?? 38} km/h</div>
            <span className="text-xs text-slate-500">NE Wind Direction</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <Droplets className="w-8 h-8 text-blue-400" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">24h Rainfall</span>
            <div className="text-2xl font-bold text-white">{vals.accumulatedRain24h ?? 65} mm</div>
            <span className="text-xs text-slate-500">Precipitation Accumulation</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <Calendar className="w-8 h-8 text-emerald-400" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">Precipitation Prob</span>
            <div className="text-2xl font-bold text-white">{vals.precipitationProbability ?? 65}%</div>
            <span className="text-xs text-slate-500">Live Observation</span>
          </div>
        </div>
      </div>

      {/* Hourly Chart */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
        <h2 className="text-base font-bold text-white">24-Hour Temperature & Wind Forecast</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly}>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Area type="monotone" dataKey="temperature" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
              <Area type="monotone" dataKey="windSpeed" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
