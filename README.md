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
- **GIS & AI:** `pydantic-v2`, `httpx`, `pytest`, `shapely`, `numpy`

---

## 📁 Complete Backend & System Structure

> See detailed backend documentation in [`backend/README.md`](file:///c:/Users/so143/Desktop/cycloneshield-ai/cycloneshield-ai/backend/README.md).

```
cycloneshield-ai/
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint & middleware setup
│   │   ├── api/
│   │   │   └── routes.py            # Central FastAPI REST router (all 18 API endpoints)
│   │   ├── core/
│   │   │   ├── config.py            # Environment settings & BaseSettings loader
│   │   │   └── logging.py           # Diagnostic logging setup ([WEATHER], [CYCLONE])
│   │   ├── schemas/                 # Pydantic v2 data contracts
│   │   │   ├── cyclone.py           # Cyclone storm, forecast points & GeoJSON schemas
│   │   │   ├── provenance.py        # Data provenance audit schema
│   │   │   ├── risk.py              # Hazard, exposure, vulnerability & risk schemas
│   │   │   ├── action_plan.py       # AI emergency action plan schema
│   │   │   ├── advisories.py        # Warning advisories schema
│   │   │   ├── copilot.py           # AI Copilot schemas
│   │   │   └── auth.py              # Authentication token schemas
│   │   ├── services/                # Business logic & provider clients
│   │   │   ├── gdacs_service.py     # Live GDACS API client & geometry parsing
│   │   │   ├── cyclone_service.py   # Canonical cyclone orchestration service
│   │   │   ├── weather_service.py   # Open-Meteo spatial grid ($U/V$ vectors, temp, press)
│   │   │   ├── osm_service.py       # Overpass API client for OpenStreetMap GIS
│   │   │   ├── earth_engine_service.py # GEE Sentinel-1 SAR & NASADEM elevation
│   │   │   ├── data_sources_service.py # Provider health audit service
│   │   │   ├── geocoding_service.py # Nominatim geocoding & reverse geocoding
│   │   │   ├── risk_engine.py       # Risk Engine pipeline orchestrator
│   │   │   ├── safe_route_service.py# Resilient shelter evacuation route calculator
│   │   │   ├── parametric_service.py# Parametric liquidity trigger monitor
│   │   │   ├── simulation_service.py# Scenario impact simulator
│   │   │   ├── copilot_briefing_service.py # AI district operational briefing generator
│   │   │   ├── action_plan_service.py # AI 6h/12h/24h emergency action directives
│   │   │   ├── alert_service.py     # Regional hazard alert generator
│   │   │   └── advisory_service.py  # Multilingual warning advisories
│   │   └── risk/                    # Risk Engine math primitives
│   │       ├── hazard.py            # Multi-hazard score calculation
│   │       ├── exposure.py          # Infrastructure & population density exposure
│   │       ├── vulnerability.py     # Topographical elevation & coastal vulnerability
│   │       ├── scoring.py           # Formula: Risk = Hazard × Exposure × Vulnerability
│   │       └── normalization.py     # Min-Max & Logarithmic normalization functions
│   ├── tests/                       # Pytest test suite
│   ├── .env
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                # LoginModal, ProtectedRoute
│   │   │   ├── layout/              # Sidebar, Header, MainLayout
│   │   │   └── map/                 # MapLibreView, LeftToolbar, BottomTimeline, TopSearchBar,
│   │   │                            # MapLegend, CyclonePlaybackControls, CycloneInfoCard, CopilotDrawer
│   │   ├── pages/                   # MapPage, LandingPage, DashboardPage, RiskAnalysisPage
│   │   ├── services/                # api.ts, mapService.ts
│   │   ├── hooks/                   # useAuth, useUserLocation
│   │   └── types/                   # index.ts
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🧮 Risk Engine Formula

$$\text{Risk Score} = \text{Hazard Score} \times \text{Exposure Score} \times \text{Vulnerability Score}$$

- **Hazard ($H$)**: Composite weighted sum of wind speed, 24h rainfall accumulation, central surface pressure drop, and storm surge wave height.
- **Exposure ($E$)**: Population density and count of critical infrastructure facilities (hospitals, evacuation shelters, schools, bridges).
- **Vulnerability ($V$)**: Topographical elevation above sea level ($< 5\text{m}$ ASL) and exponential coastal proximity decay.

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

### Run Backend Unit Tests (Network Independent)
```bash
cd backend
pytest -q
```

### Run Frontend Type Checker & Production Build
```bash
cd frontend
npx tsc -b
npm run build
```

---

## 📜 Attribution & Licenses

- **MapLibre GL JS**: Open-source MapLibre GL engine.
- **GDACS**: Global Disaster Alert and Coordination System (EC JRC / UN OCHA).
- **Open-Meteo**: Weather forecast data provided under CC BY 4.0.
- **OpenStreetMap**: Data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under ODbL.
- **Esri World Imagery**: Tiles © Esri, Maxar, Earthstar Geographics, and GIS User Community.
