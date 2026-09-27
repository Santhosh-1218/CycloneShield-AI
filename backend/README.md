# CycloneShield AI — Backend API & Risk Engine

> **High-throughput asynchronous FastAPI backend providing real-time meteorological spatial data, GDACS tropical cyclone intelligence, multi-hazard risk scoring, infrastructure GIS exposure, and AI disaster advisories.**

---

## 🏛️ System Architecture

The CycloneShield AI backend is structured as a modular, decoupled FastAPI application that ingests, normalizes, and synthesizes geospatial telemetry from multiple open-data providers into unified GeoJSON streams and risk contracts for the MapLibre GL frontend.

```
                         FASTAPI REST API LAYER (app/api/routes.py)
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
 DATA SERVICES LAYER              RISK ENGINE LAYER                  AI REASONING LAYER
 (app/services/)                  (app/risk/)                        (app/services/ai_service)
 ├── gdacs_service.py             ├── hazard.py                      ├── copilot_briefing_service
 ├── weather_service.py           ├── exposure.py                    ├── action_plan_service
 ├── osm_service.py               ├── vulnerability.py               └── advisory_service.py
 ├── earth_engine_service.py      ├── scoring.py
 └── data_sources_service.py      └── normalization.py
```

---

## 📁 Folder Structure & File Guide

```
backend/
│
├── app/
│   ├── main.py                     # FastAPI application entrypoint, CORS middleware & lifespan
│   │
│   ├── api/
│   │   └── routes.py               # Complete REST API router handling all endpoint requests
│   │
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings loading environment configuration
│   │   └── logging.py              # Diagnostic logging setup ([WEATHER], [CYCLONE], [MAP DATA])
│   │
│   ├── schemas/                    # Type-safe Pydantic v2 data contracts
│   │   ├── cyclone.py              # Cyclone storm, forecast points, and GeoJSON schemas
│   │   ├── provenance.py           # Data provenance and audit metadata schema
│   │   ├── risk.py                 # Hazard, exposure, vulnerability, and risk result schemas
│   │   ├── action_plan.py          # AI decision support action plan schema
│   │   ├── advisories.py           # Early-warning advisory generation schema
│   │   ├── copilot.py              # AI Copilot prompt/response schemas
│   │   └── auth.py                 # Firebase user authentication token schemas
│   │
│   ├── services/                   # Business logic & external API integration clients
│   │   ├── gdacs_service.py        # Dedicated GDACS API client (LIVE tropical cyclones)
│   │   ├── cyclone_service.py      # Canonical cyclone orchestration service
│   │   ├── weather_service.py      # Open-Meteo spatial grid, current, hourly & 7-day forecast
│   │   ├── osm_service.py          # Overpass API client for OpenStreetMap GIS features
│   │   ├── earth_engine_service.py # GEE Sentinel-1 SAR, CHIRPS rainfall & NASADEM elevation
│   │   ├── data_sources_service.py # Concurrent multi-provider health audit service
│   │   ├── geocoding_service.py    # OpenStreetMap Nominatim geocoding & reverse geocoding
│   │   ├── risk_engine.py          # Orchestrates composite risk calculation pipeline
│   │   ├── safe_route_service.py   # Resilient shelter evacuation route calculator
│   │   ├── parametric_service.py   # Parametric disaster liquidity trigger monitor
│   │   ├── simulation_service.py   # Deterministic cyclone impact scenario simulator
│   │   ├── copilot_briefing_service.py # Generates AI operational district briefings
│   │   ├── action_plan_service.py  # Generates 6h/12h/24h emergency action directives
│   │   ├── alert_service.py        # Generates regional emergency hazard alerts
│   │   ├── advisory_service.py     # Generates bilingual (English & Telugu) warnings
│   │   ├── layer_service.py        # MapLibre layer state management
│   │   ├── demo_service.py         # Isolated hackathon demo scenario baseline (Demo Cyclone Mocha)
│   │   └── imd_service.py          # Legacy IMD fallback adapter
│   │
│   └── risk/                       # Risk engine mathematical primitives
│       ├── hazard.py               # Multi-hazard score calculation (Wind, Rain, Pressure, Surge)
│       ├── exposure.py             # Infrastructure & population density exposure scoring
│       ├── vulnerability.py        # Terrain elevation & coastal proximity vulnerability scoring
│       ├── scoring.py              # Overall Risk Formula: Risk = Hazard × Exposure × Vulnerability
│       └── normalization.py        # Min-Max and Logarithmic data normalization functions
│
├── tests/                          # Pytest unit testing suite
│   ├── test_all_features.py        # Risk engine, safe route, and parametric monitor unit tests
│   ├── test_cyclone_pipeline.py    # GDACS live cyclone pipeline & mock response tests
│   └── test_risk_engine.py         # Risk scoring formula boundary tests
│
├── .env.example                    # Environment variable template
└── requirements.txt                # Python package dependencies
```

---

## 🧮 Risk Engine Formula & Calculations

The platform evaluates risk dynamically using a 3-factor multiplicative formula grounded in disaster management principles:

$$\text{Risk Score} = \text{Hazard Score} \times \text{Exposure Score} \times \text{Vulnerability Score}$$

### 1. Hazard Score ($H$)
Evaluates physical event severity based on real-time telemetry:
$$H = w_{\text{wind}} \cdot S_{\text{wind}} + w_{\text{rain}} \cdot S_{\text{rain}} + w_{\text{pressure}} \cdot S_{\text{pressure}} + w_{\text{surge}} \cdot S_{\text{surge}}$$
- **Wind Speed ($S_{\text{wind}}$)**: Scaled against Saffir-Simpson storm categories ($> 252\text{ km/h} \to 1.0$).
- **Rainfall ($S_{\text{rain}}$)**: 24h accumulation ($> 300\text{ mm} \to 1.0$).
- **Pressure ($S_{\text{pressure}}$)**: Central surface pressure drop below $1013.25\text{ hPa}$ ($< 920\text{ hPa} \to 1.0$).
- **Storm Surge ($S_{\text{surge}}$)**: Coastal wave setup height ($> 5.0\text{ m} \to 1.0$).

### 2. Exposure Score ($E$)
Evaluates elements at risk within the impact zone:
- **Population Density**: Grid density normalized against urban thresholds.
- **Critical Infrastructure Count**: Density of hospitals, emergency shelters, schools, bridges, and causeways.

### 3. Vulnerability Score ($V$)
Evaluates physical and topographical susceptibility:
- **Terrain Elevation**: Low-lying coastal areas ($< 5\text{m}$ ASL) receive highest vulnerability weight.
- **Coastal Proximity**: Exponential decay distance function from coastline.

---

## 📡 Complete REST API Endpoint Reference

| Method | Endpoint | Description | Sample Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health audit of all 5 providers | None |
| `GET` | `/api/geocode` | Search location coordinates by name | `q=Kakinada` |
| `GET` | `/api/reverse-geocode` | Reverse geocode coordinates | `lat=16.9891&lng=82.2475` |
| `GET` | `/api/weather` | Current real-time weather observation | `lat=16.9891&lon=82.2475` |
| `GET` | `/api/weather/hourly` | 24-48 hour hourly forecast series | `lat=16.9891&lon=82.2475` |
| `GET` | `/api/weather/forecast` | 7-day daily weather forecast | `lat=16.9891&lon=82.2475` |
| `GET` | `/api/weather/spatial` | Spatial weather grid with $U/V$ vectors | `lat=16.9891&lon=82.2475&hour_offset=0` |
| `GET` | `/api/cyclones` | Active GDACS cyclones & track GeoJSON | `lat=16.9891&lon=82.2475&demo_mode=false` |
| `GET` | `/api/infrastructure` | OpenStreetMap critical infrastructure | `lat=16.9891&lon=82.2475` |
| `GET` | `/api/flood` | Sentinel-1 SAR & NASADEM flood layer | `lat=16.9891&lon=82.2475` |
| `GET` | `/api/elevation` | NASADEM topographical elevation | `lat=16.9891&lon=82.2475` |
| `GET` | `/api/risk` | Composite Risk Engine calculation | `lat=16.9891&lon=82.2475` |
| `POST`| `/api/copilot` | AI Copilot conversational query | JSON Body `{ prompt, context }` |
| `GET` | `/api/briefing` | AI District Operational Briefing | `location_name=Kakinada&lat=16.9891&lon=82.2475` |
| `POST`| `/api/action-plan` | AI Emergency Action Plan Generator | JSON Body `{ lat, lon, risk_score, ... }` |
| `GET` | `/api/safe-route` | Resilient Evacuation Route Calculator | `lat=16.9891&lon=82.2475` |
| `GET` | `/api/parametric` | Parametric Trigger Liquidity Monitor | `lat=16.9891&lon=82.2475` |
| `POST`| `/api/simulation` | Scenario Impact Simulator | JSON Body `{ wind_speed_kmh, ... }` |

---

## 🏷️ Data Provenance & Truthfulness Policy

Every response payload includes an authoritative `provenance` metadata block:

```json
{
  "source": "GDACS (Global Disaster Alert and Coordination System)",
  "provider": "GDACS",
  "data_type": "Tropical Cyclone Event & Track Observations",
  "retrieved_at": "2026-09-28T00:30:00Z",
  "status": "LIVE",
  "confidence": 0.96,
  "is_live": true,
  "is_forecast": false
}
```

### Data Status Classification:
- **`LIVE`**: Direct real-time observations from public agency endpoints (GDACS, Open-Meteo).
- **`FORECAST`**: Physics-based atmospheric projections (Open-Meteo GFS/ICON model).
- **`MODELED`**: Deterministic risk, inundation, or surge calculations computed by the Risk Engine.
- **`SATELLITE`**: Remote sensing metadata derived from Sentinel-1 SAR or CHIRPS.
- **`DEMO`**: Synthetic storm scenario for hackathon testing (`isDemoMode: true`).
- **`UNAVAILABLE`**: Explicit status returned when upstream providers are unreachable.

---

## ⚙️ Installation & Local Setup

### 1. Environment Configuration
Create `backend/.env` based on `backend/.env.example`:
```env
PROJECT_NAME="CycloneShield AI API"
DEBUG=True
PORT=8080

# External Endpoints
WEATHER_API_BASE_URL="https://api.open-meteo.com/v1"
GDACS_MAP_API_URL="https://www.gdacs.org/gdacsapi/api/Events/geteventlist/map?eventtype=TC"

# Optional AI / GEE Credentials
GROQ_API_KEY="your_groq_api_key"
GEMINI_API_KEY="your_gemini_api_key"
```

### 2. Install Dependencies & Start Server
```bash
# Navigate to backend directory
cd backend

# Install Python packages
pip install -r requirements.txt

# Start FastAPI Uvicorn Server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```

Server starts at: `http://127.0.0.1:8080`  
Interactive OpenAPI Docs: `http://127.0.0.1:8080/docs`

### 3. Execute Pytest Suite
```bash
pytest -q
```
*(All 17 unit tests execute synchronously using mock provider responses for 100% network independence).*
