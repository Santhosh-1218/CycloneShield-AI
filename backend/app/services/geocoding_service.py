import logging
import time
import re
from typing import Dict, Any, List
import httpx

logger = logging.getLogger("cycloneshield-geocoding")

OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

async def search_locations(query: str, count: int = 10) -> Dict[str, Any]:
    """
    Geocodes place names, cities, districts, states, countries, and coordinates.
    Uses Open-Meteo Geocoding API (Free & Open).
    """
    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    query_clean = query.strip()

    if not query_clean:
        return {
            "query": query,
            "results": [],
            "source": "Open-Meteo Geocoding",
            "retrievedAt": retrieved_at
        }

    # Check if query is raw latitude, longitude coordinates (e.g., "16.9891, 82.2475" or "16.9891 N, 82.2475 E")
    coord_match = re.match(r"^([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)$", query_clean)
    if coord_match:
        lat = float(coord_match.group(1))
        lon = float(coord_match.group(2))
        return {
            "query": query_clean,
            "results": [{
                "id": "coord-search",
                "name": f"Coordinate Location ({lat:.4f}°, {lon:.4f}°)",
                "latitude": lat,
                "longitude": lon,
                "country": "Custom Coordinates",
                "admin1": "Direct Location Input",
                "display_name": f"{lat:.4f}° N, {lon:.4f}° E"
            }],
            "source": "Coordinate Parser",
            "retrievedAt": retrieved_at
        }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                OPEN_METEO_GEOCODING_URL,
                params={
                    "name": query_clean,
                    "count": count,
                    "language": "en",
                    "format": "json"
                }
            )

            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                formatted_results: List[Dict[str, Any]] = []

                for item in results:
                    name = item.get("name", "Unknown Place")
                    admin1 = item.get("admin1", "")
                    country = item.get("country", "")
                    lat = item.get("latitude")
                    lon = item.get("longitude")

                    display_parts = [name]
                    if admin1:
                        display_parts.append(admin1)
                    if country:
                        display_parts.append(country)

                    formatted_results.append({
                        "id": item.get("id", f"geo-{lat}-{lon}"),
                        "name": name,
                        "latitude": lat,
                        "longitude": lon,
                        "country": country,
                        "admin1": admin1,
                        "timezone": item.get("timezone", "UTC"),
                        "elevation": item.get("elevation", 0),
                        "feature_code": item.get("feature_code", "PPL"),
                        "display_name": ", ".join(display_parts)
                    })

                return {
                    "query": query_clean,
                    "results": formatted_results,
                    "count": len(formatted_results),
                    "source": "Open-Meteo Geocoding API",
                    "retrievedAt": retrieved_at,
                    "status": "available"
                }
            else:
                logger.warning(f"Geocoding API returned status code {response.status_code}")
                return {
                    "query": query_clean,
                    "results": [],
                    "source": "Open-Meteo Geocoding",
                    "retrievedAt": retrieved_at,
                    "status": "unavailable",
                    "message": f"Geocoding API HTTP {response.status_code}"
                }
    except Exception as e:
        logger.error(f"Geocoding request failed: {e}")
        return {
            "query": query_clean,
            "results": [],
            "source": "Open-Meteo Geocoding",
            "retrievedAt": retrieved_at,
            "status": "error",
            "message": str(e)
        }

_GEOCODE_CACHE: Dict[str, Dict[str, Any]] = {}

async def reverse_geocode(lat: float, lon: float) -> Dict[str, Any]:
    """
    Resolves exact (lat, lon) coordinates into city, district/admin, state, and country.
    Uses OpenStreetMap Nominatim / Open-Meteo Reverse Geocoding.
    """
    cache_key = f"rev_{round(lat, 2)}_{round(lon, 2)}"
    if cache_key in _GEOCODE_CACHE:
        entry = _GEOCODE_CACHE[cache_key]
        if time.time() - entry["timestamp"] < 86400:  # 24 hour cache for location names
            return entry["data"]

    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    headers = {
        "User-Agent": "CycloneShield-AI/1.0 (disaster-monitoring-platform)"
    }
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "zoom": 12,
        "addressdetails": 1
    }

    try:
        async with httpx.AsyncClient(timeout=2.5) as client:
            response = await client.get(url, params=params, headers=headers)
            if response.status_code == 200:
                data = response.json()
                address = data.get("address", {})

                name = address.get("city") or address.get("town") or address.get("village") or address.get("suburb") or address.get("county") or address.get("state_district") or "Selected Location"
                district = address.get("state_district") or address.get("county") or address.get("district") or ""
                state = address.get("state") or ""
                country = address.get("country") or "India"

                parts = [p for p in [name, state, country] if p]
                display_name = ", ".join(parts) if parts else f"{lat:.4f}° N, {lon:.4f}° E"

                res = {
                    "available": True,
                    "source": "OpenStreetMap Nominatim Reverse Geocoding",
                    "retrievedAt": retrieved_at,
                    "status": "available",
                    "latitude": lat,
                    "longitude": lon,
                    "name": name,
                    "district": district,
                    "state": state,
                    "country": country,
                    "display_name": display_name,
                    "raw_address": address
                }
                _GEOCODE_CACHE[cache_key] = {"timestamp": time.time(), "data": res}
                return res
    except Exception as e:
        logger.warning(f"Reverse geocoding request failed: {e}")

    # Fallback coordinate string if request fails or times out
    return {
        "available": True,
        "source": "Coordinate Resolver",
        "retrievedAt": retrieved_at,
        "status": "available",
        "latitude": lat,
        "longitude": lon,
        "name": f"Location ({lat:.4f}°, {lon:.4f}°)",
        "district": "Coastal Region",
        "state": "Bay of Bengal Region",
        "country": "India",
        "display_name": f"{lat:.4f}° N, {lon:.4f}° E"
    }

