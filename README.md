# CYCLONESHIELD AI

> **"Predict the impact. Protect the infrastructure. Act before landfall."**

CycloneShield AI is an AI-powered predictive disaster-risk and vulnerability platform for extreme weather events, tropical cyclones, and coastal flood hazards in the Bay of Bengal and coastal APAC region.

The platform shifts disaster management from **post-disaster response** to **pre-landfall anticipatory action** by combining real-time satellite imagery, atmospheric spatial forecasts, live global cyclone feeds, infrastructure exposure modeling, and generative AI disaster advisories into a Zoom-Earth inspired interactive map interface.

---

## 📋 Production Real-Data Architecture

### 1. Primary Live Data Feeds & Open APIs

- **Live Cyclone Tracking**: **GDACS API** (`https://www.gdacs.org/gdacsapi/api/Events/geteventlist/map?eventtype=TC`) for active tropical cyclone events, intensity categories, observed tracks, forecast points, and alert polygons. *(Strict Truthful Data Policy: Displays explicit "NO ACTIVE CYCLONE DETECTED" or "CYCLONE DATA UNAVAILABLE" when feeds are empty or unreachable — never fabricates fake cyclone paths in LIVE mode)*.
- **Atmospheric Spatial Grid**: **Open-Meteo API** for high-density spatial forecast grids ($U$ and $V$ wind vector components, precipitation accumulation, temperature fields, and surface pressure isobars).
- **Map Rendering**: **MapLibre GL JS** (`maplibre-gl`) with **Esri World Imagery** satellite raster tiles and OpenStreetMap basemaps.
- **Infrastructure GIS**: **OpenStreetMap** via **Overpass API** (Hospitals, Emergency Shelters, Schools, Bridges, Roads, and Critical Buildings).
- **Satellite & Hazard GIS**: **Google Earth Engine (GEE)**, Sentinel-1 SAR water masks, CHIRPS precipitation grids, and NASADEM elevation.
- **AI Disaster Copilot**: **Gemini 2.5 Flash / Groq LLM API** for automated risk synthesis, district operational briefings, and multilingual (English & Telugu) emergency warnings.
- **System Health Audit**: `/api/health` endpoint auditing GDACS, Open-Meteo, GEE, Overpass, and AI services concurrently.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Map Engine:** MapLibre GL JS + 60 FPS HTML5 Canvas Wind Particle Engine
- **Styling:** Tailwind CSS (Navy / Tactical Command dark theme)
- **Routing:** React Router v6
- **Auth:** Firebase Auth (Google OAuth)
- **Icons:** Lucide React

### Backend
- **Framework:** Python 3.12+ / FastAPI
- **Server:** Uvicorn
- **HTTP Client:** `httpx` (Async concurrent execution)
- **GIS & AI:** `maplibre-gl`, `pydantic-v2`, `httpx`, `pytest`

---

## 📁 Project Structure

```
cycloneshield-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # LoginModal, ProtectedRoute
│   │   │   ├── layout/        # Sidebar, Header, MainLayout
│   │   │   └── map/           # MapLibreView, LeftToolbar, BottomTimeline, TopSearchBar, 
│   │   │                      # MapLegend, CyclonePlaybackControls, CycloneInfoCard, CopilotDrawer
│   │   ├── pages/             # MapPage, LandingPage, DashboardPage, RiskAnalysisPage
│   │   ├── services/          # api.ts, mapService.ts
│   │   ├── hooks/             # useAuth, useUserLocation
│   │   └── types/             # index.ts
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entrypoint
│   │   ├── api/               # API endpoints (/api/weather, /api/cyclone, /api/risk, /api/health)
│   │   ├── services/          # gdacs_service, weather_service, osm_service, risk_engine, ai_service
│   │   ├── core/              # Config & settings
│   │   └── schemas/           # Pydantic data contracts
│   ├── tests/                 # Pytest suite
│   ├── .env
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Quick Start Guide

### 1. Start FastAPI Backend Server
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```
- API Base URL: `http://127.0.0.1:8080`
- System Health Audit: `http://127.0.0.1:8080/api/health`
- OpenAPI Docs: `http://127.0.0.1:8080/docs`

### 2. Start Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Frontend Map Platform: `http://localhost:5173`

---

## 🧪 Verification & Testing

### Run Backend Unit Tests
```bash
cd backend
pytest -q
```

### Run Frontend Type Checker
```bash
cd frontend
npx tsc -b
```

---

## 📜 Attribution & Licenses

- **MapLibre GL JS**: Open-source MapLibre GL engine.
- **GDACS**: Global Disaster Alert and Coordination System (EC JRC / UN OCHA).
- **Open-Meteo**: Weather forecast data provided under CC BY 4.0.
- **OpenStreetMap**: Data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under ODbL.
- **Esri World Imagery**: Tiles © Esri, Maxar, Earthstar Geographics, and GIS User Community.
