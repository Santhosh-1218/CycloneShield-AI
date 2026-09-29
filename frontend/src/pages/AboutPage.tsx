import React from 'react';
import { Shield, Globe, Radio, Building2, Bot } from 'lucide-react';
import { Card } from '../components/common/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 text-[#111111] py-4">
      <div className="space-y-3 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">CycloneShield AI Platform</h1>
        <p className="text-[#666666] max-w-2xl mx-auto text-sm leading-relaxed">
          AI-powered severe weather, tropical cyclone, flood, infrastructure vulnerability, and geographic risk intelligence platform — transforming disaster response into anticipatory action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <Card padding="md" hoverEffect>
          <div className="flex items-center space-x-2 text-[#16A34A] font-bold text-sm mb-2">
            <Radio className="w-4 h-4" />
            <span>Open-Meteo High Resolution Weather</span>
          </div>
          <p className="text-[#666666] leading-relaxed">
            Real-time surface temperature, relative humidity, 24-hour precipitation accumulation, wind velocity vectors, surface pressure, and 7-day hourly forecasts.
          </p>
        </Card>

        <Card padding="md" hoverEffect>
          <div className="flex items-center space-x-2 text-[#16A34A] font-bold text-sm mb-2">
            <Globe className="w-4 h-4" />
            <span>Google Earth Engine & Satellite SAR</span>
          </div>
          <p className="text-[#666666] leading-relaxed">
            Copernicus Sentinel-1 Synthetic Aperture Radar (SAR) all-weather inundation indicators, NASADEM 30m elevation terrain grids, CHIRPS rainfall grids, and Dynamic World land cover.
          </p>
        </Card>

        <Card padding="md" hoverEffect>
          <div className="flex items-center space-x-2 text-[#16A34A] font-bold text-sm mb-2">
            <Building2 className="w-4 h-4" />
            <span>OpenStreetMap Overpass Infrastructure</span>
          </div>
          <p className="text-[#666666] leading-relaxed">
            Real-time spatial queries for hospitals, evacuation cyclone shelters, schools, primary roads, causeways, and critical bridges in hazard zones.
          </p>
        </Card>

        <Card padding="md" hoverEffect>
          <div className="flex items-center space-x-2 text-[#16A34A] font-bold text-sm mb-2">
            <Bot className="w-4 h-4" />
            <span>Transparent Risk Engine & AI Copilot</span>
          </div>
          <p className="text-[#666666] leading-relaxed">
            Formulaic numerical calculation combining Hazard, Exposure, and Vulnerability. Gemini AI explains risk drivers using real-time data without hallucinating.
          </p>
        </Card>
      </div>
    </div>
  );
};
