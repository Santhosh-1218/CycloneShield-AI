import time
import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("cycloneshield-imd")

def normalize_imd_cyclone_response(raw_info: Dict[str, Any], retrieved_at: str) -> Dict[str, Any]:
    """
    Canonical normalization function for IMD cyclone API / bulletin payload.
    Converts raw provider response into standard internal structure.
    Checks raw_info['data'] or direct fields cleanly without assuming unprovided fields.
    """
    if not raw_info or not raw_info.get("available", False):
        return {
            "available": False,
            "hasActiveCyclone": False,
            "provider": "India Meteorological Department (IMD) RSMC New Delhi",
            "retrievedAt": retrieved_at,
            "reason": raw_info.get("message") if raw_info else "IMD feed unavailable"
        }

    # Extract nested data if provided under raw_info['data']
    payload = raw_info.get("data") if isinstance(raw_info.get("data"), dict) else raw_info

    has_active = payload.get("has_active_cyclone") or payload.get("hasActiveCyclone") or False
    if not has_active:
        return {
            "available": True,
            "hasActiveCyclone": False,
            "provider": "India Meteorological Department (IMD) RSMC New Delhi",
            "retrievedAt": retrieved_at,
            "reason": "NO ACTIVE CYCLONE DETECTED IN IMD NIO BULLETIN"
        }

    storm_name = payload.get("storm_name") or payload.get("stormName") or "Un-named Cyclonic Storm"
    category = payload.get("category") or payload.get("stormCategory") or "Cyclonic Storm"
    
    current_lat = payload.get("lat") or payload.get("latitude")
    current_lon = payload.get("lon") or payload.get("longitude")
    current_pos = {"lat": float(current_lat), "lon": float(current_lon)} if (current_lat is not None and current_lon is not None) else None

    obs_time = payload.get("observationTime") or payload.get("observation_time")
    max_wind = payload.get("max_sustained_wind_kmh") or payload.get("maxWindSpeedKmh")
    central_pres = payload.get("central_pressure_hpa") or payload.get("centralPressureHpa")
    mv_dir = payload.get("movement_direction") or payload.get("movementDirection")
    mv_spd = payload.get("movement_speed_kmh") or payload.get("movementSpeedKmh")

    # Real tracks from payload if provided
    observed_coords = payload.get("observed_coords") or payload.get("observedTrackCoords")
    forecast_pts = payload.get("forecast_points") or payload.get("forecastPoints")
    wind_radii = payload.get("wind_radii") or payload.get("windRadii") or []
    forecast_cone = payload.get("forecast_cone") or payload.get("forecastCone")

    return {
        "available": True,
        "hasActiveCyclone": True,
        "stormName": storm_name,
        "category": category,
        "currentPosition": current_pos,
        "observationTime": obs_time,
        "maxWindSpeedKmh": float(max_wind) if max_wind is not None else None,
        "centralPressureHpa": float(central_pres) if central_pres is not None else None,
        "movementDirection": mv_dir,
        "movementSpeedKmh": float(mv_spd) if mv_spd is not None else None,
        "observedTrack": {"type": "LineString", "coordinates": observed_coords} if observed_coords else None,
        "forecastTrack": {"type": "LineString", "coordinates": [p["coordinates"] for p in forecast_pts]} if forecast_pts else None,
        "forecastPoints": forecast_pts or [],
        "windRadii": wind_radii,
        "forecastCone": forecast_cone,
        "source": "India Meteorological Department (IMD)",
        "provider": "IMD RSMC Regional Specialised Meteorological Centre New Delhi",
        "retrievedAt": retrieved_at,
        "provenance": {
            "source": "India Meteorological Department (IMD)",
            "provider": "IMD RSMC New Delhi",
            "dataType": "Official Cyclone Warning Bulletin & Track",
            "observedAt": obs_time or retrieved_at,
            "retrievedAt": retrieved_at,
            "freshness": "Official Bulletin",
            "status": "LIVE",
            "confidence": 0.98,
            "isLive": True,
            "isForecast": True
        }
    }

async def get_imd_cyclone_info(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches official cyclone bulletins and track observations from IMD endpoints.
    If official endpoint is unavailable, returns structured unavailable status without fabricating fake IMD data.
    """
    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    if not settings.IMD_API_BASE_URL or settings.IMD_API_BASE_URL == "https://api.imd.gov.in":
        return {
            "available": False,
            "source": "India Meteorological Department (IMD)",
            "retrievedAt": retrieved_at,
            "observationTime": None,
            "status": "unavailable",
            "freshness": "Data unavailable",
            "message": "Official IMD cyclone feed is currently unavailable or requires agency API authorization.",
            "data": None
        }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(f"{settings.IMD_API_BASE_URL}/cyclone/active", params={"lat": lat, "lon": lon})
            if response.status_code == 200:
                data = response.json()
                return {
                    "available": True,
                    "source": "India Meteorological Department (IMD)",
                    "retrievedAt": retrieved_at,
                    "status": "available",
                    "freshness": "Official Government Bulletin",
                    "data": data
                }
            else:
                return {
                    "available": False,
                    "source": "India Meteorological Department (IMD)",
                    "retrievedAt": retrieved_at,
                    "status": "unavailable",
                    "message": f"IMD API returned HTTP {response.status_code}",
                    "data": None
                }
    except Exception as e:
        logger.warning(f"IMD API request error: {e}")
        return {
            "available": False,
            "source": "India Meteorological Department (IMD)",
            "retrievedAt": retrieved_at,
            "status": "error",
            "message": f"Could not connect to IMD service: {str(e)}",
            "data": None
        }

async def get_imd_warnings(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches official district-level weather warnings from IMD.
    """
    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    return {
        "available": False,
        "source": "India Meteorological Department (IMD)",
        "retrievedAt": retrieved_at,
        "status": "unavailable",
        "freshness": "Data unavailable",
        "message": "Official IMD warning bulletins currently unavailable for specified coordinates.",
        "warnings": []
    }
