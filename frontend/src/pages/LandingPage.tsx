import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Building2, 
  Radio, 
  Satellite, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Bot,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MapLibreView } from '../components/map/MapLibreView';
import { fetchCurrentWeather } from '../services/api';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const w = await fetchCurrentWeather(16.9891, 82.2475);
      setWeather(w);
    }
    load();
  }, []);

  const featureCards = [
    {
      icon: Radio,
      title: 'Real-time Cyclone Tracking',
      description: 'Multi-layer atmospheric tracking and trajectory projections visualizing landfall, wind velocity, and central pressure.',
      badge: 'IMD API'
    },
    {
      icon: Satellite,
      title: 'Satellite Inundation Indicators',
      description: 'Copernicus Sentinel-1 SAR imagery & NASADEM DEM height grids for coastal flood inundation indicators.',
      badge: 'Earth Engine'
    },
    {
      icon: Building2,
      title: 'Infrastructure Risk Mapping',
      description: 'OpenStreetMap Overpass queries for hospitals, evacuation cyclone shelters, bridges, and primary evacuation corridors.',
      badge: 'OpenStreetMap'
    },
    {
      icon: Bot,
      title: 'AI Decision-Support Copilot',
      description: 'Gemini / Groq LLM advisory generation explaining numerical risk scores using data without hallucinating.',
      badge: 'Gemini / Groq'
    }
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between select-none">
      {/* Top Banner Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block leading-none">
                CYCLONESHIELD <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 block tracking-wider uppercase mt-0.5">
                COASTAL DISASTER RISK PLATFORM
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-bold">● LIVE DATA</span>
            </div>

            <Link
              to="/risk-map"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center space-x-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Explore Risk Map</span>
            </Link>

            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-cyan-950/80 border border-cyan-800/60 px-3 py-1.5 rounded-full text-xs font-mono text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Anticipatory Action & Risk Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              CYCLONESHIELD <span className="text-cyan-400">AI</span>
            </h1>

            <p className="text-xl font-bold text-cyan-300 leading-snug">
              Predict risk before disaster strikes.
            </p>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Real-time coastal cyclone, flood, weather, infrastructure exposure, and disaster-risk platform for the Bay of Bengal and APAC. Combining Open-Meteo observations, Google Earth Engine SAR radar, OpenStreetMap facilities, and Gemini AI decision support.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/risk-map"
                className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-600/30 transition-all flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Explore Risk Map</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold text-xs border border-slate-700 shadow-xl transition-all"
              >
                Launch Dashboard
              </Link>

              <Link
                to="/forecast"
                className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 font-bold text-xs border border-slate-800 transition-all"
              >
                View Live Weather
              </Link>

              <Link
                to="/about"
                className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition-all"
              >
                Learn More
              </Link>
            </div>

            <div className="pt-2 flex items-center space-x-3 text-xs font-mono text-slate-400">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Data</span>
              </span>
              <span>•</span>
              <span>Open-Meteo</span>
              <span>•</span>
              <span>OpenStreetMap</span>
              <span>•</span>
              <span>Google Earth Engine</span>
            </div>
          </div>

          {/* Hero Right Map Preview Window */}
          <div className="lg:col-span-6 relative h-[420px] rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
            <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-white flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kakinada Coastal Demo Zone</span>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px]">RISK: 82/100</span>
            </div>

            <MapLibreView
              layers={{
                rainfall: true,
                wind: true,
                cycloneTrack: true,
                floodIndicator: true,
                hospitals: true,
                shelters: true,
                roads: true
              }}
              overlayOpacity={0.7}
              selectedLocation={{ lat: 16.9891, lng: 82.2475 }}
              onLocationSelect={() => navigate('/risk-map')}
            />

            <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Kakinada Coastal Zone</span>
                <span className="text-[11px] text-slate-400">Temp: {weather?.values?.temperature || 27}°C • Wind: {weather?.values?.windSpeed || 38} km/h</span>
              </div>
              <Link
                to="/risk-map"
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1"
              >
                <span>Full Map</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                    {card.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-navy-900/90 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        © {new Date().getFullYear()} CYCLONESHIELD AI — Disaster Risk Intelligence & Anticipatory Action Platform
      </footer>
    </div>
  );
};
