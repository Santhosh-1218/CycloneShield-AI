# CycloneShield AI — Frontend Web Application

Interactive disaster risk platform frontend built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **MapLibre GL JS**.

## 🚀 Features

- **10 Zoom-Earth Map Modes**: Satellite, Animated Wind Field, Rainfall Heatmap, Temperature Gradient, Pressure Isobars, Live Cyclone Tracks, Flood Risk, Storm Surge, Infrastructure GIS, and Integrated Risk.
- **60 FPS Canvas Particle Engine**: Real-time vector projection of $U$ and $V$ wind components mapped via MapLibre coordinates.
- **Cyclone Track Playback Controls**: Interactive timeline interpolation controls (`0.5x`, `1x`, `2x`, `4x`) floating in the bottom-right corner.
- **Location Search & Auto-FlyTo**: Fast geocoding and reverse geocoding location updates across all GIS data layers.
- **AI Copilot & Emergency Briefing Generator**: Automated district risk analysis and multilingual emergency advisories.

## 🛠 Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Typecheck build
npx tsc -b

# Production build
npm run build
```
