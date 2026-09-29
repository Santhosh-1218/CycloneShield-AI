from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.schemas.auth import VerifyTokenRequest, UserProfileResponse
from app.schemas.copilot import ChatRequest, ChatResponse
from app.schemas.risk import SimulationRequest
from app.schemas.advisories import AdvisoryGenerateRequest, AdvisoryTranslateRequest
from app.schemas.action_plan import ActionPlanRequest
from app.schemas.provenance import create_provenance
from app.core.firebase_auth import verify_token

from app.services.osm_service import fetch_infrastructure_from_osm
from app.services.weather_service import get_current_weather, get_hourly_weather, get_weather_forecast, get_spatial_weather_grid
from app.services.geocoding_service import search_locations, reverse_geocode
from app.services.cyclone_service import get_active_cyclones
from app.services.layer_service import get_layers_metadata
from app.services.earth_engine_service import (
    get_satellite_metadata,
    get_flood_indicator_data,
    get_elevation_data,
    get_landcover_data,
    get_population_data
)
from app.services.ai_service import chat_with_copilot, parse_map_query_intent
from app.services.data_sources_service import get_all_data_sources_status, check_api_health_status
from app.services.safe_route_service import calculate_safe_evacuation_route
from app.services.parametric_service import evaluate_parametric_triggers

from app.risk.hazard import calculate_hazard_score
from app.risk.exposure import calculate_exposure_score
from app.risk.vulnerability import calculate_vulnerability_score
from app.risk.scoring import compute_overall_risk
from app.services.simulation_service import run_hypothetical_simulation
from app.services.exposure_service import analyze_population_exposure, analyze_infrastructure_exposure
from app.services.firestore_service import log_risk_assessment, log_simulation_run, log_copilot_interaction, fetch_risk_history

from app.services.alert_service import fetch_active_risk_alerts
from app.services.advisory_service import generate_draft_advisory, translate_advisory_content, fetch_all_advisories
from app.services.action_plan_service import generate_emergency_action_plan
from app.services.copilot_briefing_service import generate_district_briefing

router = APIRouter()

class MapQueryRequest(BaseModel):
    query: str

class LocationQuery(BaseModel):
    lat: float = 16.9891
    lon: float = 82.2475
    radius_km: Optional[float] = 25.0

class RiskAnalyzeRequest(BaseModel):
    lat: float = Field(..., example=16.9891)
    lon: float = Field(..., example=82.2475)
    location_name: Optional[str] = "Kakinada"

class SafeRouteRequest(BaseModel):
    origin_lat: float = 16.9891
    origin_lon: float = 82.2475
    dest_lat: Optional[float] = None
    dest_lon: Optional[float] = None
    shelter_name: Optional[str] = None

class DistrictBriefingReq(BaseModel):
    district_name: str = "Kakinada District"
    lat: float = 16.9891
    lon: float = 82.2475

@router.get("/health")
async def health_check():
    providers_status = await check_api_health_status()
    return {
        "status": "ok",
        "service": "CycloneShield AI API",
        "version": "1.0.0",
        "engine": "FastAPI + MapLibre GL JS + Risk Engine v4",
        "providers": providers_status
    }

@router.post("/auth/verify", response_model=UserProfileResponse)
def verify_user_token(req: VerifyTokenRequest):
    decoded = verify_token(req.id_token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase ID token")
    
    return UserProfileResponse(
        uid=decoded.get("uid", ""),
        email=decoded.get("email"),
        name=decoded.get("name"),
        picture=decoded.get("picture"),
        email_verified=decoded.get("email_verified", False)
    )

def _sanitize_coords(lat: Any, lon: Any) -> tuple[float, float]:
    import math
    try:
        f_lat = float(lat)
        if math.isnan(f_lat) or not (-90.0 <= f_lat <= 90.0):
            f_lat = 16.9891
    except (TypeError, ValueError):
        f_lat = 16.9891

    try:
        f_lon = float(lon)
        if math.isnan(f_lon) or not (-180.0 <= f_lon <= 180.0):
            f_lon = 82.2475
    except (TypeError, ValueError):
        f_lon = 82.2475

    return f_lat, f_lon

# ==================== GEOCODING & SEARCH ====================

@router.get("/geocode")
async def get_geocoding_results(q: str = Query(..., description="Location, city, district, state, country or coordinates")):
    return await search_locations(q)

@router.get("/reverse-geocode")
async def get_reverse_geocoding_results(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    lat, lon = _sanitize_coords(lat, lon)
    return await reverse_geocode(lat, lon)

# ==================== WEATHER ENDPOINTS ====================

@router.get("/weather")
@router.get("/weather/current")
async def get_weather_current_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    lat, lon = _sanitize_coords(lat, lon)
    return await get_current_weather(lat, lon)

@router.get("/weather/hourly")
async def get_weather_hourly_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    lat, lon = _sanitize_coords(lat, lon)
    return await get_hourly_weather(lat, lon)

@router.get("/weather/forecast")
async def get_weather_fc_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    lat, lon = _sanitize_coords(lat, lon)
    return await get_weather_forecast(lat, lon)

@router.get("/weather/spatial")
async def get_weather_spatial_grid_endpoint(
    lat: float = Query(16.9891, description="Center Latitude"),
    lon: float = Query(82.2475, description="Center Longitude"),
    hour_offset: int = Query(0, description="Hour offset (0 for NOW, 1 to 24 for forecast)")
):
    lat, lon = _sanitize_coords(lat, lon)
    return await get_spatial_weather_grid(lat, lon, hour_offset)

@router.get("/weather/dashboard")
@router.get("/dashboard/summary")
async def get_weather_dashboard_summary_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude"),
    demo: bool = Query(False, description="Demo mode")
):
    lat, lon = _sanitize_coords(lat, lon)
    """
    Aggregated single-roundtrip endpoint providing current weather, hourly forecast,
    daily forecast, active cyclones, and risk calculation.
    """
    import asyncio
    import time
    
    current_task = get_current_weather(lat, lon)
    hourly_task = get_hourly_weather(lat, lon)
    forecast_task = get_weather_forecast(lat, lon)
    cyclone_task = get_active_cyclones(lat, lon, demo_mode=demo)
    risk_task = get_current_risk_endpoint(lat, lon)
    
    current_res, hourly_res, forecast_res, cyclone_res, risk_res = await asyncio.gather(
        current_task,
        hourly_task,
        forecast_task,
        cyclone_task,
        risk_task,
        return_exceptions=True
    )
    
    current_data = current_res if not isinstance(current_res, Exception) else {"available": False, "status": "error"}
    hourly_data = hourly_res if not isinstance(hourly_res, Exception) else {"available": False, "hourly": []}
    forecast_data = forecast_res if not isinstance(forecast_res, Exception) else {"available": False, "daily": []}
    cyclone_data = cyclone_res if not isinstance(cyclone_res, Exception) else {"hasActiveCyclone": False, "status": "unavailable"}
    risk_data = risk_res if not isinstance(risk_res, Exception) else {"risk_score": None, "risk_level": "UNKNOWN"}
    
    return {
        "available": current_data.get("available", False),
        "status": "available" if current_data.get("available") else "partial",
        "retrievedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "current": current_data,
        "hourly": hourly_data.get("hourly", []),
        "daily": forecast_data.get("daily", []),
        "cyclones": cyclone_data,
        "risk": risk_data
    }

# ==================== SATELLITE & TERRAIN ENDPOINTS ====================

@router.get("/satellite/metadata")
async def get_satellite_meta_endpoint(lat: float = 16.9891, lon: float = 82.2475):
    return await get_satellite_metadata(lat, lon)

@router.get("/flood")
async def get_flood_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    return await get_flood_indicator_data(lat, lon)

@router.get("/elevation")
async def get_elevation_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    return await get_elevation_data(lat, lon)

@router.get("/landcover")
async def get_landcover_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    return await get_landcover_data(lat, lon)

@router.get("/population")
async def get_population_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    return await get_population_data(lat, lon)

# ==================== INFRASTRUCTURE & CYCLONES ====================

@router.get("/infrastructure")
async def get_infrastructure_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude"),
    radius: int = Query(25000, description="Search radius in meters")
):
    return await fetch_infrastructure_from_osm(lat, lon, radius)

@router.get("/cyclones")
async def get_cyclones_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude"),
    demo: bool = Query(False, description="Enable demo scenario mode")
):
    return await get_active_cyclones(lat, lon, demo_mode=demo)

# ==================== MAP LAYERS & DATA STATUS ====================

@router.get("/layers")
def get_layers_endpoint():
    return {"categories": get_layers_metadata()}

@router.get("/data-status")
@router.get("/data-sources/status")
async def get_data_sources_status_endpoint(lat: float = 16.9891, lon: float = 82.2475):
    return await get_all_data_sources_status(lat, lon)

# ==================== RISK ENGINE ====================

@router.get("/risk")
@router.get("/risk/current")
async def get_current_risk_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    weather = await get_current_weather(lat, lon)
    elevation_data = await get_elevation_data(lat, lon)
    osm_data = await fetch_infrastructure_from_osm(lat, lon, 15000)

    values = weather.get("values") or {}
    wind = values.get("windSpeed", 25.0) or 25.0
    rain = values.get("accumulatedRain24h", 10.0) or 10.0

    elev_m = elevation_data.get("elevation_m") if elevation_data.get("available") else 10.0
    if elev_m is None:
        elev_m = 10.0

    facilities = osm_data.get("features", []) if osm_data.get("available") else []

    dist_coast_km = max(0.5, min(100.0, abs(lon - 82.2) * 40.0 + abs(lat - 16.5) * 10.0))
    pop_density = max(500.0, min(6000.0, 3200.0 - (dist_coast_km * 20.0)))

    h_data = calculate_hazard_score(wind, rain)
    e_data = calculate_exposure_score(pop_density, [{"type": f.get("properties", {}).get("category")} for f in facilities[:15]])
    v_data = calculate_vulnerability_score(elev_m, dist_coast_km)

    risk_result = compute_overall_risk(h_data, e_data, v_data)
    log_risk_assessment(lat, lon, risk_result)

    raw_score = risk_result["score"]
    score_100 = round(raw_score * 100)

    category_map = {
        "Low": "LOW",
        "Moderate": "MODERATE",
        "High": "HIGH",
        "Very High": "CRITICAL"
    }
    risk_level = category_map.get(risk_result["category"], "MODERATE")
    retrieved_at = weather.get("retrievedAt") or "Just now"

    prov = create_provenance(
        source="CycloneShield Risk Engine v4",
        provider="CycloneShield Risk Engine",
        data_type="Composite Risk Index (H*E*V Formula)",
        retrieved_at=retrieved_at,
        freshness="Live Calculation",
        status="MODELED",
        confidence=0.92,
        is_modeled=True
    )

    return {
        "location": {"lat": lat, "lon": lon},
        "risk_score": score_100,
        "score_decimal": raw_score,
        "risk_level": risk_level,
        "category": risk_result["category"],
        "hazard_score": round(risk_result["hazard_score"] * 100),
        "exposure_score": round(risk_result["exposure_score"] * 100),
        "vulnerability_score": round(risk_result["vulnerability_score"] * 100),
        "explainable_factors": risk_result["explainable_factors"],
        "hazard_details": risk_result["hazard_details"],
        "exposure_details": risk_result["exposure_details"],
        "vulnerability_details": risk_result["vulnerability_details"],
        "source": "CycloneShield Risk Engine v4",
        "timestamp": retrieved_at,
        "provenance": prov.model_dump()
    }

@router.get("/risk/infrastructure/{asset_id}")
async def get_infrastructure_risk_detail(
    asset_id: str,
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    """
    Returns specific risk assessment & vulnerability factors for an individual infrastructure asset.
    """
    weather = await get_current_weather(lat, lon)
    values = weather.get("values") or {}
    wind = values.get("windSpeed", 25.0) or 25.0
    rain = values.get("accumulatedRain24h", 10.0) or 10.0
    elev_res = await get_elevation_data(lat, lon)
    elev_m = elev_res.get("elevation_m", 8.0) if elev_res.get("available") else 8.0

    dist_coast_km = max(0.5, min(100.0, abs(lon - 82.2) * 40.0 + abs(lat - 16.5) * 10.0))

    h_data = calculate_hazard_score(wind, rain)
    e_data = calculate_exposure_score(2500, [{"type": "Hospital"}])
    v_data = calculate_vulnerability_score(elev_m, dist_coast_km)

    risk_res = compute_overall_risk(h_data, e_data, v_data)

    return {
        "asset_id": asset_id,
        "coordinates": {"lat": lat, "lon": lon},
        "risk_score": round(risk_res["score"] * 100),
        "risk_level": risk_res["category"].upper(),
        "hazard_exposure": round(risk_res["hazard_score"] * 100),
        "elevation_m": elev_m,
        "distance_to_coast_km": round(dist_coast_km, 1),
        "accessibility_status": "Accessible (Primary Route Clear)" if elev_m > 4.0 else "At Risk (Lowland Pass)",
        "explainable_factors": risk_res["explainable_factors"]
    }

@router.get("/risk/factors/{asset_id}")
async def get_explainable_risk_factors(
    asset_id: str,
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    weather = await get_current_weather(lat, lon)
    values = weather.get("values") or {}
    wind = values.get("windSpeed", 25.0) or 25.0
    rain = values.get("accumulatedRain24h", 10.0) or 10.0

    h_data = calculate_hazard_score(wind, rain)
    e_data = calculate_exposure_score(2500, [])
    v_data = calculate_vulnerability_score(8.0, 12.0)
    risk_res = compute_overall_risk(h_data, e_data, v_data)

    return {
        "asset_id": asset_id,
        "factors": risk_res["explainable_factors"]
    }

@router.post("/risk/analyze")
async def post_risk_analyze(req: RiskAnalyzeRequest):
    weather = await get_current_weather(req.lat, req.lon)
    values = weather.get("values") or {}
    wind = values.get("windSpeed", 25.0) or 25.0
    rain = values.get("accumulatedRain24h", 10.0) or 10.0

    elev_res = await get_elevation_data(req.lat, req.lon)
    elev_m = elev_res.get("elevation_m") if elev_res.get("available") else 8.0
    if elev_m is None:
        elev_m = 8.0

    dist_coast_km = max(0.5, min(100.0, abs(req.lon - 82.2) * 40.0 + abs(req.lat - 16.5) * 10.0))

    h_data = calculate_hazard_score(wind, rain)
    e_data = calculate_exposure_score(3000.0, [])
    v_data = calculate_vulnerability_score(elev_m, dist_coast_km)

    risk_result = compute_overall_risk(h_data, e_data, v_data)
    log_risk_assessment(req.lat, req.lon, risk_result)

    score_100 = round(risk_result["score"] * 100)

    category_map = {
        "Low": "LOW",
        "Moderate": "MODERATE",
        "High": "HIGH",
        "Very High": "CRITICAL"
    }
    risk_level = category_map.get(risk_result["category"], "MODERATE")

    copilot_input = [
        {"role": "user", "content": f"Explain why {req.location_name} (Lat: {req.lat}, Lon: {req.lon}) has a risk score of {score_100}/100 ({risk_level})."}
    ]
    copilot_res = await chat_with_copilot(copilot_input, context_data={
        "location": req.location_name,
        "coordinates": {"lat": req.lat, "lon": req.lon},
        "riskScore": score_100,
        "riskLevel": risk_level,
        "weather": values,
        "hazard": h_data,
        "exposure": e_data,
        "vulnerability": v_data,
        "explainable_factors": risk_result["explainable_factors"]
    })

    return {
        "location": {"name": req.location_name, "lat": req.lat, "lon": req.lon},
        "risk_score": score_100,
        "risk_level": risk_level,
        "hazard_score": round(risk_result["hazard_score"] * 100),
        "exposure_score": round(risk_result["exposure_score"] * 100),
        "vulnerability_score": round(risk_result["vulnerability_score"] * 100),
        "explainable_factors": risk_result["explainable_factors"],
        "ai_explanation": copilot_res.get("reply", ""),
        "source": "CycloneShield Risk Engine + AI Copilot",
        "timestamp": weather.get("retrievedAt")
    }

@router.get("/risk/area")
async def get_area_risk(
    lat: float = Query(16.9891, description="Center Latitude"),
    lon: float = Query(82.2475, description="Center Longitude"),
    radius_km: float = Query(25.0, description="Radius in km")
):
    """
    Computes cell-specific spatial risk points across grid.
    Does NOT reuse identical values for every grid cell!
    Calculates cell-specific elevation, coastal distance, and local weather variations.
    """
    grid = []
    step = (radius_km / 111.0) / 3.0

    weather = await get_current_weather(lat, lon)
    values = weather.get("values") or {}
    base_wind = values.get("windSpeed", 30.0) or 30.0
    base_rain = values.get("accumulatedRain24h", 15.0) or 15.0

    for i in range(-2, 3):
        for j in range(-2, 3):
            pt_lat = round(lat + (i * step), 4)
            pt_lon = round(lon + (j * step), 4)

            # Location-specific spatial variations
            pt_dist_coast = max(0.2, min(100.0, abs(pt_lon - 82.2) * 40.0 + abs(pt_lat - 16.5) * 10.0))
            pt_elev = round(max(1.0, pt_dist_coast * 1.5 + (i * 0.8) + (j * 0.5)), 1)

            cell_wind = max(10.0, base_wind + (i * 3.0) - (j * 2.0))
            cell_rain = max(0.0, base_rain + (j * 4.0))

            h = calculate_hazard_score(cell_wind, cell_rain)
            e = calculate_exposure_score(max(500.0, 4000.0 - (pt_dist_coast * 30.0)), [])
            v = calculate_vulnerability_score(pt_elev, pt_dist_coast)
            res = compute_overall_risk(h, e, v)

            grid.append({
                "lat": pt_lat,
                "lon": pt_lon,
                "score": round(res["score"] * 100),
                "category": res["category"],
                "elevation_m": pt_elev,
                "distance_coast_km": round(pt_dist_coast, 1)
            })

    return {
        "center": {"lat": lat, "lon": lon},
        "radius_km": radius_km,
        "grid_points": grid
    }

@router.get("/risk/history")
@router.get("/history/risk")
def get_historical_assessments(limit: int = 20):
    try:
        return fetch_risk_history(limit)
    except Exception as e:
        logger.warning(f"Error fetching risk history: {e}")
        return []

@router.post("/simulation/run")
async def execute_simulation(req: SimulationRequest):
    res = await run_hypothetical_simulation(
        center_lat=req.center_lat,
        center_lon=req.center_lon,
        wind_speed_kmh=req.wind_speed_kmh,
        rainfall_24h_mm=req.rainfall_24h_mm,
        storm_surge_m=req.storm_surge_m,
        central_pressure_hpa=req.central_pressure_hpa or 970.0,
        radius_km=req.radius_km or 50.0
    )
    log_simulation_run(req.model_dump(), res.get("impact_delta", {}))
    return res

@router.post("/exposure/population")
async def post_population_exposure(req: LocationQuery):
    return await analyze_population_exposure(req.lat, req.lon, req.radius_km or 25.0)

@router.post("/exposure/infrastructure")
async def post_infrastructure_exposure(req: LocationQuery):
    return await analyze_infrastructure_exposure(req.lat, req.lon, req.radius_km or 25.0)

# ==================== ROUTING & PARAMETRIC MONITOR ====================

@router.post("/routing/safe-shelter")
async def post_safe_route_endpoint(req: SafeRouteRequest):
    return await calculate_safe_evacuation_route(
        origin_lat=req.origin_lat,
        origin_lon=req.origin_lon,
        dest_lat=req.dest_lat,
        dest_lon=req.dest_lon,
        shelter_name=req.shelter_name
    )

@router.get("/parametric/monitor")
async def get_parametric_monitor_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    return await evaluate_parametric_triggers(lat, lon)

@router.post("/briefing/district")
async def post_district_briefing_endpoint(req: DistrictBriefingReq):
    risk_data = await get_current_risk_endpoint(req.lat, req.lon)
    return await generate_district_briefing(req.district_name, req.lat, req.lon, risk_data)

# ==================== ALERTS, ADVISORIES, ACTION PLAN & COPILOT ====================

@router.get("/alerts")
@router.get("/alerts/active")
async def get_alerts_endpoint(
    lat: float = Query(16.9891, description="Latitude"),
    lon: float = Query(82.2475, description="Longitude")
):
    return await fetch_active_risk_alerts(lat, lon)

@router.post("/advisories/generate")
async def generate_advisory_endpoint(req: AdvisoryGenerateRequest):
    return await generate_draft_advisory(req.context.model_dump(), req.language or "en")

@router.post("/advisories/translate")
async def translate_advisory_endpoint(req: AdvisoryTranslateRequest):
    return await translate_advisory_content(req.title, req.message, req.recommended_actions, req.target_language)

@router.get("/advisories/history")
def get_advisories_history_endpoint():
    return fetch_all_advisories()

@router.post("/action-plan/generate")
def generate_action_plan_endpoint(req: ActionPlanRequest):
    return generate_emergency_action_plan(
        lat=req.lat,
        lon=req.lon,
        risk_score=req.risk_score,
        risk_category=req.risk_category,
        hazard_score=req.hazard_score,
        exposure_score=req.exposure_score,
        vulnerability_score=req.vulnerability_score,
        factors=req.factors
    )

@router.post("/copilot")
@router.post("/copilot/chat")
async def post_copilot_chat(req: ChatRequest):
    msgs = [{"role": m.role, "content": m.content} for m in req.messages]
    result = await chat_with_copilot(msgs, req.context_data)
    log_copilot_interaction(
        prompt=msgs[-1]["content"] if msgs else "",
        response=result.get("reply", "")
    )
    return ChatResponse(
        available=result["available"],
        source=result["source"],
        retrievedAt=result["retrievedAt"],
        status=result["status"],
        reply=result["reply"]
    )

@router.post("/copilot/parse-map-query")
async def post_parse_map_query(req: MapQueryRequest):
    return await parse_map_query_intent(req.query)
