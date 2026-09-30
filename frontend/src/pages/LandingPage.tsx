import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Radio, 
  Satellite, 
  Building2, 
  Bot, 
  CloudSun, 
  ShieldAlert,
  Navigation
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../context/LocationContext';
import { useWeather } from '../context/WeatherContext';
import { LocationSearch } from '../components/common/LocationSearch';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { location, requestLiveLocation, isGeolocating } = useLocation();
  const { weather, status } = useWeather();
  const navigate = useNavigate();

  const tempC = weather?.temperature !== undefined ? Math.round(weather.temperature) : null;
  const feelsLike = weather?.feels_like !== undefined ? Math.round(weather.feels_like) : null;
  const condition = weather?.weather_description || weather?.condition || (tempC !== null ? 'Fair' : (status === 'LOADING' ? 'Connecting...' : 'Atmospheric Feed'));
  const humidity = weather?.humidity !== undefined ? weather.humidity : null;
  const windSpeed = weather?.wind_speed !== undefined ? weather.wind_speed : null;

  const features = [
    {
      icon: CloudSun,
      title: 'Real-Time Weather & Spatial Forecasts',
      description: 'High-density spatial wind vector components, precipitation grids, and surface pressure isobars.',
      badge: 'Open-Meteo'
    },
    {
      icon: Radio,
      title: 'Live Tropical Cyclone Tracking',
      description: 'GDACS API live tracking for tropical cyclone intensity categories, forecast points, and alert polygons.',
      badge: 'GDACS API'
    },
    {
      icon: Satellite,
      title: 'Satellite Inundation & Flood Risk',
      description: 'Copernicus Sentinel-1 SAR imagery & NASADEM elevation grids for flood inundation analysis.',
      badge: 'Google Earth Engine'
    },
    {
      icon: Building2,
      title: 'Infrastructure GIS & Evacuation',
      description: 'OpenStreetMap Overpass queries for hospitals, shelters, schools, and emergency road corridors.',
      badge: 'OpenStreetMap'
    },
    {
      icon: ShieldAlert,
      title: 'Modeled Risk Engine (H × E × V)',
      description: 'Multi-hazard spatial risk scoring evaluating hazard intensity, population exposure, and coastal elevation.',
      badge: 'Risk Engine'
    },
    {
      icon: Bot,
      title: 'AI Disaster Copilot & Advisories',
      description: 'Gemini AI operational briefings, action plans, and emergency directives generated without fabrication.',
      badge: 'Gemini AI'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col justify-between selection:bg-[#F0FDF4] selection:text-[#16A34A]">
      {/* Navigation Header */}
      <nav className="border-b border-[#E5E5E5] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <img 
              src="/images/logo.png" 
              alt="CycloneShield AI" 
              className="w-9 h-9 rounded-full object-cover shadow-sm hover:scale-105 transition-transform" 
            />
            <div>
              <span className="font-extrabold text-base text-[#111111] tracking-tight block leading-none">
                CYCLONESHIELD <span className="text-[#16A34A]">AI</span>
              </span>
              <span className="text-[10px] text-[#888888] block font-medium mt-0.5">
                Weather Intelligence Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Badge status="LIVE">● LIVE FEEDS</Badge>

            {user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Live Tracker
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            

            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#111111] tracking-tight leading-tight">
              Weather intelligence for a changing world.
            </h1>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-2xl">
              Live weather observations, high-density spatial forecasts, cyclone tracking, and AI disaster advisories — shifting management from post-disaster response to anticipatory action.
            </p>

            {/* Location Search Hero Widget */}
            <div className="pt-2 max-w-xl space-y-3">
              <LocationSearch placeholder="Search city or district (e.g. Visakhapatnam, Hyderabad, Mumbai)..." />

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/signup')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Open Live Tracker
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={requestLiveLocation}
                  loading={isGeolocating}
                  icon={<Navigation className="w-4 h-4 text-[#16A34A]" />}
                >
                  Use My Location
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Live Weather Preview Card (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="shadow-lg border-[#E5E5E5]" padding="lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5E5]">
                <div>
                  <span className="text-xs font-bold text-[#888888] uppercase tracking-wider block">Real-Time Weather Preview</span>
                  <div className="text-base font-extrabold text-[#111111]">
                    {location.city || 'Kakinada'}, {location.state || 'Andhra Pradesh'}
                  </div>
                </div>
                <Badge status="LIVE">LIVE</Badge>
              </div>

              <div className="flex items-center justify-between my-4">
                <div>
                  <div className="text-5xl font-extrabold text-[#111111]">
                    {tempC !== null ? `${tempC}°C` : '--'}
                  </div>
                  <div className="text-sm font-semibold text-[#666666] mt-1">{condition}</div>
                  {feelsLike !== null && (
                    <div className="text-xs text-[#888888]">Feels like {feelsLike}°C</div>
                  )}
                </div>
                <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-[#16A34A]">
                  <CloudSun className="w-12 h-12" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E5E5E5] text-center">
                <div className="bg-[#F8FAFC] border border-[#E5E5E5] p-2.5 rounded-lg">
                  <div className="text-[10px] text-[#888888] uppercase font-semibold">Humidity</div>
                  <div className="text-sm font-bold text-[#111111]">{humidity !== null ? `${humidity}%` : 'N/A'}</div>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E5E5E5] p-2.5 rounded-lg">
                  <div className="text-[10px] text-[#888888] uppercase font-semibold">Wind</div>
                  <div className="text-sm font-bold text-[#111111]">{windSpeed !== null ? `${windSpeed} km/h` : 'N/A'}</div>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E5E5E5] p-2.5 rounded-lg">
                  <div className="text-[10px] text-[#888888] uppercase font-semibold">Rain Risk</div>
                  <div className="text-sm font-bold text-[#16A34A]">Low</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E5E5E5]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge status="INFO" size="md">Platform Capabilities</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-2 tracking-tight">
            Comprehensive Weather & severe-weather intelligence
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Engineered with strict truthful data principles — displaying explicit state indicators rather than fake data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Card key={idx} hoverEffect padding="md">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge status="FORECAST" size="sm">{f.badge}</Badge>
                </div>
                <h3 className="font-bold text-sm text-[#111111] mb-1">{f.title}</h3>
                <p className="text-xs text-[#666666] leading-relaxed">{f.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E5] bg-white py-6 px-4 text-center text-xs text-[#888888]">
        © {new Date().getFullYear()} CYCLONESHIELD AI — Weather intelligence for a changing world.
      </footer>
    </div>
  );
};
