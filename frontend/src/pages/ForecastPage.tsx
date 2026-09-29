import React from 'react';
import { Wind, Droplets, Thermometer, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useLocation } from '../context/LocationContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ForecastPage: React.FC = () => {
  const { location } = useLocation();
  const { weather, hourlyForecast, status, isRefreshing, refresh, errorMessage } = useWeather();

  const tempC = weather?.temperature !== undefined ? Math.round(weather.temperature) : null;
  const feelsLike = weather?.feels_like !== undefined ? Math.round(weather.feels_like) : null;
  const windSpeed = weather?.wind_speed !== undefined ? Math.round(weather.wind_speed) : null;
  const humidity = weather?.humidity !== undefined ? Math.round(weather.humidity) : null;
  const precipitation = weather?.precipitation !== undefined ? weather.precipitation : null;

  // Format hourly data for the chart from real hourly forecast
  const chartData = (hourlyForecast && hourlyForecast.length > 0)
    ? hourlyForecast.slice(0, 24).map((h: any, idx: number) => {
        let label = `${idx}:00`;
        if (h.time) {
          try {
            const d = new Date(h.time);
            label = !isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : String(h.time).slice(11, 16) || `${idx}:00`;
          } catch {
            label = `${idx}:00`;
          }
        }
        return {
          time: label,
          temperature: typeof h.temperature === 'number' ? Math.round(h.temperature) : null,
          windSpeed: typeof h.windSpeed === 'number' ? Math.round(h.windSpeed) : (typeof h.wind_speed === 'number' ? Math.round(h.wind_speed) : null)
        };
      })
    : [];

  return (
    <div className="space-y-6 text-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Weather & Atmospheric Forecast
            </h1>
            <Badge status="FORECAST">10-Day & 24h</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location.city || 'Kakinada'}, {location.state || 'Andhra Pradesh'} • Open-Meteo Atmospheric Forecast Model
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => refresh(true)}
          disabled={isRefreshing}
          icon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {status === 'ERROR' && !weather && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626]" />
            <span>{errorMessage || 'Unable to load atmospheric forecast data.'}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => refresh(true)}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#888888] uppercase">Temperature</span>
              <div className="text-2xl font-extrabold text-[#111111]">
                {tempC !== null ? `${tempC}°C` : '--'}
              </div>
              <span className="text-xs text-[#666666]">
                {feelsLike !== null ? `Feels like ${feelsLike}°C` : 'Feels like --'}
              </span>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#888888] uppercase">Wind Velocity</span>
              <div className="text-2xl font-extrabold text-[#111111]">
                {windSpeed !== null ? `${windSpeed} km/h` : '--'}
              </div>
              <span className="text-xs text-[#666666]">Coastal Surface Wind</span>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#888888] uppercase">Humidity</span>
              <div className="text-2xl font-extrabold text-[#111111]">
                {humidity !== null ? `${humidity}%` : '--'}
              </div>
              <span className="text-xs text-[#666666]">Relative Humidity</span>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#888888] uppercase">Precipitation</span>
              <div className="text-2xl font-extrabold text-[#111111]">
                {precipitation !== null ? `${precipitation} mm` : '--'}
              </div>
              <span className="text-xs text-[#666666]">Observation / Model</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 24-Hour Recharts Chart */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#111111]">24-Hour Temperature & Wind Forecast Projection</h2>
          <Badge status="FORECAST">Hourly Model</Badge>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="time" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5', color: '#111111', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="temperature" stroke="#16A34A" fill="#F0FDF4" fillOpacity={0.8} name="Temp (°C)" connectNulls />
                <Area type="monotone" dataKey="windSpeed" stroke="#0284C7" fill="#F0F9FF" fillOpacity={0.5} name="Wind (km/h)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#888888] border border-dashed border-[#E5E5E5] rounded-lg">
              {status === 'LOADING' ? 'Loading forecast models...' : 'Forecast unavailable'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

