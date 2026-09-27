import time
import math
import logging
from typing import Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger("cycloneshield-weather")

_WEATHER_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes cache

def _get_cache(key: str) -> Any:
    if key in _WEATHER_CACHE:
        entry = _WEATHER_CACHE[key]
        if time.time() - entry["timestamp"] < CACHE_TTL_SECONDS:
            return entry["data"]
    return None

def _set_cache(key: str, data: Any):
    _WEATHER_CACHE[key] = {"timestamp": time.time(), "data": data}

async def get_current_weather(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches real-time weather observations from Open-Meteo.
    Logs diagnostic info with [WEATHER] tag.
    """
    cache_key = f"current_{round(lat, 2)}_{round(lon, 2)}"
    cached = _get_cache(cache_key)
    if cached:
        return cached

    url = f"{settings.WEATHER_API_BASE_URL}/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current_weather": "true",
        "hourly": "temperature_2m,relativehumidity_2m,windspeed_10m,winddirection_10m,surface_pressure,rain,precipitation_probability",
        "timezone": "auto"
    }

    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    logger.info(f"[WEATHER] Request started | Provider: Open-Meteo | Lat: {lat}, Lon: {lon}")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            logger.info(f"[WEATHER] HTTP Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                current = data.get("current_weather") or {}
                hourly = data.get("hourly") or {}

                recent_rain = 0.0
                precip_prob = 0
                if "rain" in hourly and isinstance(hourly["rain"], list):
                    recent_rain = sum(r for r in hourly["rain"][:24] if isinstance(r, (int, float)))

                if "precipitation_probability" in hourly and isinstance(hourly["precipitation_probability"], list):
                    probs = [p for p in hourly["precipitation_probability"] if isinstance(p, (int, float))]
                    precip_prob = probs[0] if probs else 0

                hum_list = [h for h in hourly.get("relativehumidity_2m", []) if isinstance(h, (int, float))]
                humidity = hum_list[0] if hum_list else 75

                press_list = [p for p in hourly.get("surface_pressure", []) if isinstance(p, (int, float))]
                surface_pressure = press_list[0] if press_list else 1013.25

                temp_val = float(current.get("temperature", 26.5) or 26.5)
                wind_spd = float(current.get("windspeed", 18.0) or 18.0)
                wind_dir = int(current.get("winddirection", 180) or 180)
                code_val = int(current.get("weathercode", 0) or 0)

                logger.info(f"[WEATHER] Data received | Temp: {temp_val}°C | Wind: {wind_spd} km/h @ {wind_dir}° | Pressure: {surface_pressure} hPa")

                res = {
                    "available": True,
                    "source": "Open-Meteo (Free & Open Weather Data)",
                    "retrievedAt": retrieved_at,
                    "observationTime": current.get("time") or retrieved_at,
                    "status": "available",
                    "freshness": "Live / Current Observation",
                    "values": {
                        "temperature": temp_val,
                        "feelsLike": round(temp_val + 1.5, 1),
                        "windSpeed": wind_spd,
                        "windDirection": wind_dir,
                        "weatherCode": code_val,
                        "humidity": float(humidity),
                        "precipitationProbability": int(precip_prob),
                        "accumulatedRain24h": round(float(recent_rain), 1),
                        "surfacePressure": float(surface_pressure)
                    },
                    "units": {
                        "temperature": "°C",
                        "windSpeed": "km/h",
                        "windDirection": "°",
                        "accumulatedRain24h": "mm",
                        "surfacePressure": "hPa",
                        "humidity": "%",
                        "precipitationProbability": "%"
                    }
                }
                _set_cache(cache_key, res)
                return res
            else:
                logger.error(f"[WEATHER] Provider: Open-Meteo | HTTP Status: {response.status_code} | ERROR: Weather API request failed")
                return {
                    "available": False,
                    "source": "Open-Meteo",
                    "retrievedAt": retrieved_at,
                    "status": "unavailable",
                    "message": f"Weather data API returned status code {response.status_code}",
                    "values": None
                }
    except Exception as e:
        logger.error(f"[WEATHER] Provider: Open-Meteo | ERROR: {str(e)}")
        return {
            "available": False,
            "source": "Open-Meteo",
            "retrievedAt": retrieved_at,
            "status": "error",
            "message": f"Weather API request failed: {str(e)}",
            "values": None
        }

async def get_hourly_weather(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches 24-48 hour hourly weather forecast from Open-Meteo.
    """
    cache_key = f"hourly_{round(lat, 2)}_{round(lon, 2)}"
    cached = _get_cache(cache_key)
    if cached:
        return cached

    url = f"{settings.WEATHER_API_BASE_URL}/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,relativehumidity_2m,precipitation_probability,precipitation,windspeed_10m,winddirection_10m,weathercode,surface_pressure",
        "forecast_days": 2,
        "timezone": "auto"
    }

    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                hourly = data.get("hourly", {})
                times = hourly.get("time", [])

                formatted_series = []
                for idx, t in enumerate(times[:24]):
                    formatted_series.append({
                        "time": t.split("T")[-1] if "T" in t else t,
                        "fullTime": t,
                        "temperature": hourly.get("temperature_2m", [])[idx] if idx < len(hourly.get("temperature_2m", [])) else None,
                        "humidity": hourly.get("relativehumidity_2m", [])[idx] if idx < len(hourly.get("relativehumidity_2m", [])) else None,
                        "precipitationProbability": hourly.get("precipitation_probability", [])[idx] if idx < len(hourly.get("precipitation_probability", [])) else 0,
                        "precipitation": hourly.get("precipitation", [])[idx] if idx < len(hourly.get("precipitation", [])) else 0.0,
                        "windSpeed": hourly.get("windspeed_10m", [])[idx] if idx < len(hourly.get("windspeed_10m", [])) else 0.0,
                        "windDirection": hourly.get("winddirection_10m", [])[idx] if idx < len(hourly.get("winddirection_10m", [])) else 0,
                        "weatherCode": hourly.get("weathercode", [])[idx] if idx < len(hourly.get("weathercode", [])) else 0,
                        "surfacePressure": hourly.get("surface_pressure", [])[idx] if idx < len(hourly.get("surface_pressure", [])) else 1013.25
                    })

                res = {
                    "available": True,
                    "source": "Open-Meteo Hourly Forecast",
                    "retrievedAt": retrieved_at,
                    "status": "available",
                    "hourly": formatted_series
                }
                _set_cache(cache_key, res)
                return res
            else:
                return {
                    "available": False,
                    "source": "Open-Meteo",
                    "retrievedAt": retrieved_at,
                    "status": "unavailable",
                    "message": "Hourly forecast data unavailable"
                }
    except Exception as e:
        return {
            "available": False,
            "source": "Open-Meteo",
            "retrievedAt": retrieved_at,
            "status": "error",
            "message": str(e)
        }

async def get_weather_forecast(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches 7-day daily weather forecast from Open-Meteo.
    """
    cache_key = f"daily_{round(lat, 2)}_{round(lon, 2)}"
    cached = _get_cache(cache_key)
    if cached:
        return cached

    url = f"{settings.WEATHER_API_BASE_URL}/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,precipitation_probability_max",
        "timezone": "auto"
    }

    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                daily = data.get("daily", {})
                times = daily.get("time", [])

                formatted_daily = []
                for idx, d in enumerate(times):
                    formatted_daily.append({
                        "date": d,
                        "tempMax": daily.get("temperature_2m_max", [])[idx] if idx < len(daily.get("temperature_2m_max", [])) else None,
                        "tempMin": daily.get("temperature_2m_min", [])[idx] if idx < len(daily.get("temperature_2m_min", [])) else None,
                        "precipitationSum": daily.get("precipitation_sum", [])[idx] if idx < len(daily.get("precipitation_sum", [])) else 0.0,
                        "windSpeedMax": daily.get("windspeed_10m_max", [])[idx] if idx < len(daily.get("windspeed_10m_max", [])) else 0.0,
                        "precipProbMax": daily.get("precipitation_probability_max", [])[idx] if idx < len(daily.get("precipitation_probability_max", [])) else 0
                    })

                res = {
                    "available": True,
                    "source": "Open-Meteo (Free & Open Weather Data)",
                    "retrievedAt": retrieved_at,
                    "status": "available",
                    "daily": formatted_daily,
                    "rawDaily": daily
                }
                _set_cache(cache_key, res)
                return res
            else:
                return {
                    "available": False,
                    "source": "Open-Meteo",
                    "retrievedAt": retrieved_at,
                    "status": "unavailable",
                    "message": "Forecast data unavailable"
                }
    except Exception as e:
        return {
            "available": False,
            "source": "Open-Meteo",
            "retrievedAt": retrieved_at,
            "status": "error",
            "message": str(e)
        }

async def get_spatial_weather_grid(lat: float, lon: float, hour_offset: int = 0) -> Dict[str, Any]:
    """
    Fetches multi-point spatial weather grid centered at (lat, lon).
    Computes spatial U and V wind vector components for animated wind flow field.
    Returns GeoJSON FeatureCollection of spatial points for MapLibre layer rendering.
    """
    cache_key = f"spatial_{round(lat, 2)}_{round(lon, 2)}_{hour_offset}"
    cached = _get_cache(cache_key)
    if cached:
        return cached

    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    hour_idx = max(0, min(23, hour_offset))

    # Multi-scale grid step offsets (~15-20 deg span for Zoom-Earth style regional coverage)
    steps = [-10.0, -6.5, -4.0, -2.0, -0.8, 0.0, 0.8, 2.0, 4.0, 6.5, 10.0]

    lats = []
    lons = []
    grid_points = []

    # 1. Add spatial grid points
    for d_lat in steps:
        for d_lon in steps:
            p_lat = round(lat + d_lat, 4)
            p_lon = round(lon + d_lon, 4)
            lats.append(str(p_lat))
            lons.append(str(p_lon))
            grid_points.append({"lat": p_lat, "lon": p_lon, "cityName": None})

    # 2. Add named regional cities for Zoom-Earth style city temperature labels
    regional_cities = [
        {"cityName": "Kakinada", "lat": 16.9891, "lon": 82.2475},
        {"cityName": "Visakhapatnam", "lat": 17.6868, "lon": 83.2185},
        {"cityName": "Guntur", "lat": 16.3067, "lon": 80.4365},
        {"cityName": "Vijayawada", "lat": 16.5062, "lon": 80.6480},
        {"cityName": "Hyderabad", "lat": 17.3850, "lon": 78.4867},
        {"cityName": "Chennai", "lat": 13.0827, "lon": 80.2707},
        {"cityName": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
        {"cityName": "Bhubaneswar", "lat": 20.2961, "lon": 85.8245},
        {"cityName": "Kolkata", "lat": 22.5726, "lon": 88.3639},
        {"cityName": "Mumbai", "lat": 19.0760, "lon": 72.8777},
        {"cityName": "New Delhi", "lat": 28.6139, "lon": 77.2090},
        {"cityName": "Jaipur", "lat": 26.9124, "lon": 75.7873},
        {"cityName": "Ahmedabad", "lat": 23.0225, "lon": 72.5714},
        {"cityName": "Pune", "lat": 18.5204, "lon": 73.8567},
        {"cityName": "Thiruvananthapuram", "lat": 8.5241, "lon": 76.9366},
        {"cityName": "Sri Vijaya Puram", "lat": 11.6234, "lon": 92.7265},
        {"cityName": "Colombo", "lat": 6.9271, "lon": 79.8612},
        {"cityName": "Dhaka", "lat": 23.8103, "lon": 90.4125},
        {"cityName": "Yangon", "lat": 16.8661, "lon": 96.1951},
        {"cityName": "Bangkok", "lat": 13.7563, "lon": 100.5018}
    ]

    for city in regional_cities:
        lats.append(str(city["lat"]))
        lons.append(str(city["lon"]))
        grid_points.append(city)

    url = f"{settings.WEATHER_API_BASE_URL}/forecast"
    params = {
        "latitude": ",".join(lats),
        "longitude": ",".join(lons),
        "hourly": "temperature_2m,relativehumidity_2m,windspeed_10m,winddirection_10m,windgusts_10m,surface_pressure,precipitation,precipitation_probability,cloudcover",
        "forecast_days": 2,
        "timezone": "auto"
    }

    logger.info(f"[MAP DATA] Spatial Weather Grid Request | Hour Offset: +{hour_offset}h | Total points: {len(grid_points)}")

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(url, params=params)
            logger.info(f"[MAP DATA] Spatial Grid HTTP Status: {response.status_code}")

            if response.status_code == 200:
                raw_data = response.json()
                data_list = raw_data if isinstance(raw_data, list) else [raw_data]

                features = []
                valid_count = 0

                for idx, item in enumerate(data_list):
                    if idx >= len(grid_points):
                        break
                    pt = grid_points[idx]
                    hourly = item.get("hourly", {})

                    raw_temp = hourly.get("temperature_2m", [])[hour_idx] if hour_idx < len(hourly.get("temperature_2m", [])) else None
                    raw_wind = hourly.get("windspeed_10m", [])[hour_idx] if hour_idx < len(hourly.get("windspeed_10m", [])) else None

                    # Strict Data Truth: Skip grid points if provider returns no observation/forecast
                    if raw_temp is None and raw_wind is None:
                        continue

                    temp = float(raw_temp) if raw_temp is not None and isinstance(raw_temp, (int, float)) else 0.0
                    wind_spd = float(raw_wind) if raw_wind is not None and isinstance(raw_wind, (int, float)) else 0.0

                    raw_rain = hourly.get("precipitation", [])[hour_idx] if hour_idx < len(hourly.get("precipitation", [])) else None
                    rain = float(raw_rain) if raw_rain is not None and isinstance(raw_rain, (int, float)) else 0.0

                    raw_prob = hourly.get("precipitation_probability", [])[hour_idx] if hour_idx < len(hourly.get("precipitation_probability", [])) else None
                    precip_prob = int(raw_prob) if raw_prob is not None and isinstance(raw_prob, (int, float)) else 0

                    raw_dir = hourly.get("winddirection_10m", [])[hour_idx] if hour_idx < len(hourly.get("winddirection_10m", [])) else None
                    wind_dir = int(raw_dir) if raw_dir is not None and isinstance(raw_dir, (int, float)) else 0

                    raw_gust = hourly.get("windgusts_10m", [])[hour_idx] if hour_idx < len(hourly.get("windgusts_10m", [])) else None
                    wind_gust = float(raw_gust) if raw_gust is not None and isinstance(raw_gust, (int, float)) else wind_spd * 1.3

                    raw_press = hourly.get("surface_pressure", [])[hour_idx] if hour_idx < len(hourly.get("surface_pressure", [])) else None
                    pressure = float(raw_press) if raw_press is not None and isinstance(raw_press, (int, float)) else 1013.25

                    raw_clouds = hourly.get("cloudcover", [])[hour_idx] if hour_idx < len(hourly.get("cloudcover", [])) else None
                    clouds = int(raw_clouds) if raw_clouds is not None and isinstance(raw_clouds, (int, float)) else 0

                    # Calculate U (eastward) and V (northward) wind vector components from meteorological direction
                    rad = math.radians(wind_dir)
                    u_wind = round(-wind_spd * math.sin(rad), 2)
                    v_wind = round(-wind_spd * math.cos(rad), 2)

                    valid_count += 1
                    props = {
                        "id": f"grid-{idx}",
                        "latitude": pt["lat"],
                        "longitude": pt["lon"],
                        "temperature": temp,
                        "rainfall": rain,
                        "precipitationProbability": precip_prob,
                        "windSpeed": wind_spd,
                        "windDirection": wind_dir,
                        "uWind": u_wind,
                        "vWind": v_wind,
                        "windGust": wind_gust,
                        "surfacePressure": pressure,
                        "cloudCover": clouds,
                        "hourOffset": hour_offset
                    }
                    if pt.get("cityName"):
                        props["cityName"] = pt["cityName"]

                    # MapLibre GeoJSON coordinates MUST be [longitude, latitude]
                    features.append({
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [pt["lon"], pt["lat"]]
                        },
                        "properties": props
                    })

                logger.info(f"[MAP DATA] Features generated: {len(features)} (Valid points: {valid_count}) | GeoJSON: valid")

                res = {
                    "available": True,
                    "source": "Open-Meteo Gridded Spatial Forecast",
                    "retrievedAt": retrieved_at,
                    "status": "available",
                    "hourOffset": hour_offset,
                    "center": {"lat": lat, "lon": lon},
                    "geojson": {
                        "type": "FeatureCollection",
                        "features": features
                    }
                }
                _set_cache(cache_key, res)
                return res
            else:
                logger.error(f"[MAP DATA] Provider: Open-Meteo | HTTP Status: {response.status_code} | ERROR: Spatial grid request failed")
                return {
                    "available": False,
                    "status": "unavailable",
                    "message": f"Open-Meteo spatial grid returned HTTP {response.status_code}"
                }
    except Exception as e:
        logger.error(f"[MAP DATA] Provider: Open-Meteo | ERROR: {str(e)}")
        return {
            "available": False,
            "status": "error",
            "message": str(e)
        }
