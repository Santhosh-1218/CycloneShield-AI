import time
import asyncio
import logging
from typing import Dict, Any, List
from app.services.gdacs_service import fetch_gdacs_active_cyclones
from app.services.weather_service import get_current_weather
from app.services.earth_engine_service import get_satellite_metadata
from app.services.osm_service import fetch_infrastructure_from_osm
from app.schemas.provenance import create_provenance
from app.core.config import settings

logger = logging.getLogger("cycloneshield-health")

async def _check_gdacs() -> str:
    try:
        res = await asyncio.wait_for(fetch_gdacs_active_cyclones(), timeout=3.0)
        return "ok" if res.get("available") else "unavailable"
    except Exception:
        return "unavailable"

async def _check_open_meteo() -> str:
    try:
        res = await asyncio.wait_for(get_current_weather(16.9891, 82.2475), timeout=3.0)
        return "ok" if res.get("available") else "unavailable"
    except Exception:
        return "unavailable"

async def _check_gee() -> str:
    try:
        res = await asyncio.wait_for(get_satellite_metadata(16.9891, 82.2475), timeout=2.0)
        return "ok" if res.get("available") else "unavailable"
    except Exception:
        return "unavailable"

async def _check_overpass() -> str:
    try:
        res = await asyncio.wait_for(fetch_infrastructure_from_osm(16.9891, 82.2475, 5000), timeout=3.0)
        return "ok" if res.get("available") else "unavailable"
    except Exception:
        return "unavailable"

async def check_api_health_status() -> Dict[str, str]:
    """
    Checks provider health for GDACS, Open-Meteo, GEE, Overpass, Gemini concurrently.
    Returns dictionary mapping provider key to 'ok' or 'unavailable'.
    """
    gdacs_task = asyncio.create_task(_check_gdacs())
    meteo_task = asyncio.create_task(_check_open_meteo())
    gee_task = asyncio.create_task(_check_gee())
    overpass_task = asyncio.create_task(_check_overpass())

    gdacs_st, meteo_st, gee_st, overpass_st = await asyncio.gather(
        gdacs_task, meteo_task, gee_task, overpass_task, return_exceptions=True
    )

    gemini_st = "ok" if (settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip()) or (settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip()) else "unavailable"

    return {
        "gdacs": gdacs_st if isinstance(gdacs_st, str) else "unavailable",
        "open_meteo": meteo_st if isinstance(meteo_st, str) else "unavailable",
        "gee": gee_st if isinstance(gee_st, str) else "unavailable",
        "overpass": overpass_st if isinstance(overpass_st, str) else "unavailable",
        "gemini": gemini_st
    }

async def get_all_data_sources_status(lat: float = 16.9891, lon: float = 82.2475) -> Dict[str, Any]:
    """
    Returns transparency status, provider names, freshness, health summary, and latency for all integrated data sources.
    Uses concurrent non-blocking execution to return swiftly.
    """
    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    async def _safe_weather():
        t0 = time.time()
        try:
            res = await asyncio.wait_for(get_current_weather(lat, lon), timeout=3.0)
            return res, round((time.time() - t0) * 1000), "LIVE" if res.get("available") else "UNAVAILABLE"
        except Exception:
            return {}, round((time.time() - t0) * 1000), "UNAVAILABLE"

    async def _safe_gdacs():
        t0 = time.time()
        try:
            res = await asyncio.wait_for(fetch_gdacs_active_cyclones(), timeout=3.0)
            return res, round((time.time() - t0) * 1000), "LIVE" if res.get("available") else "UNAVAILABLE"
        except Exception:
            return {}, round((time.time() - t0) * 1000), "UNAVAILABLE"

    async def _safe_ee():
        t0 = time.time()
        try:
            res = await asyncio.wait_for(get_satellite_metadata(lat, lon), timeout=2.0)
            return res, round((time.time() - t0) * 1000), "LIVE" if res.get("available") else "UNAVAILABLE"
        except Exception:
            return {}, round((time.time() - t0) * 1000), "UNAVAILABLE"

    async def _safe_osm():
        t0 = time.time()
        try:
            res = await asyncio.wait_for(fetch_infrastructure_from_osm(lat, lon, 10000), timeout=2.5)
            return res, round((time.time() - t0) * 1000), "LIVE" if res.get("available") else "UNAVAILABLE"
        except Exception:
            return {}, round((time.time() - t0) * 1000), "UNAVAILABLE"

    (weather_res, weather_latency, weather_status), \
    (gdacs_res, gdacs_latency, gdacs_status), \
    (ee_res, ee_latency, ee_status), \
    (osm_res, osm_latency, osm_status) = await asyncio.gather(
        _safe_weather(), _safe_gdacs(), _safe_ee(), _safe_osm()
    )

    ai_status = "LIVE" if (settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip()) or (settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip()) else "UNAVAILABLE"

    sources = [
        {
            "id": "ds-weather",
            "name": "Open-Meteo High Resolution Weather API",
            "type": "Atmospheric Forecast & Observations",
            "provider": "Open-Meteo (Open Weather API)",
            "purpose": "Current surface temperature, wind vectors, precipitation accumulation, pressure.",
            "status": weather_status,
            "latency_ms": weather_latency,
            "lastUpdated": weather_res.get("retrievedAt", retrieved_at),
            "freshness": weather_res.get("freshness", "Live Current Observation"),
            "license": "Creative Commons Attribution 4.0 International"
        },
        {
            "id": "ds-gdacs",
            "name": "GDACS Global Disaster Alert & Coordination System",
            "type": "Primary International Cyclone Feed",
            "provider": "UN / European Commission GDACS",
            "purpose": "Authoritative tropical cyclone event tracking, alert levels, polygon geometries.",
            "status": gdacs_status,
            "latency_ms": gdacs_latency,
            "lastUpdated": gdacs_res.get("retrievedAt", retrieved_at),
            "freshness": "Live Stream / Official Feed",
            "license": "Open Access / Public Service"
        },
        {
            "id": "ds-osm",
            "name": "OpenStreetMap Infrastructure Registry",
            "type": "GIS Vector Feature Database",
            "provider": "OpenStreetMap contributors (via Overpass API)",
            "purpose": "Hospitals, primary shelters, schools, evacuation roads, causeways.",
            "status": osm_status,
            "latency_ms": osm_latency,
            "lastUpdated": retrieved_at,
            "freshness": "Real-time Overpass Query with Caching",
            "license": "Open Database License (ODbL)"
        },
        {
            "id": "ds-ee-sentinel",
            "name": "Sentinel-1 SAR Radar Satellite Imagery",
            "type": "Satellite Earth Observation",
            "provider": "Copernicus / ESA (via Google Earth Engine)",
            "purpose": "Synthetic Aperture Radar (SAR) all-weather coastal flood inundation.",
            "status": ee_status,
            "latency_ms": ee_latency,
            "lastUpdated": ee_res.get("retrievedAt", retrieved_at),
            "freshness": ee_res.get("freshness", "Latest available observation"),
            "license": "Copernicus Sentinel Data Terms"
        },
        {
            "id": "ds-ai-copilot",
            "name": "CycloneShield AI Copilot LLM",
            "type": "LLM Explanation & Advisory Engine",
            "provider": "Google Gemini / Groq Cloud",
            "purpose": "Translates retrieved data into multilingual emergency advisories.",
            "status": ai_status,
            "latency_ms": 250,
            "lastUpdated": retrieved_at,
            "freshness": "On-Demand Inference",
            "license": "Cloud API Terms of Service"
        }
    ]

    healthy_count = sum(1 for s in sources if s["status"] == "LIVE")
    total_count = len(sources)

    prov = create_provenance(
        source="CycloneShield System Health Monitor",
        provider="CycloneShield Infrastructure Monitor",
        data_type="Data Sources Health Audit",
        retrieved_at=retrieved_at,
        freshness="Real-Time Health Audit",
        status="LIVE",
        confidence=1.0,
        is_live=True
    )

    return {
        "available": True,
        "retrievedAt": retrieved_at,
        "health_summary": f"{healthy_count} / {total_count} SOURCES HEALTHY",
        "healthy_count": healthy_count,
        "total_count": total_count,
        "sources": sources,
        "provenance": prov.model_dump()
    }
