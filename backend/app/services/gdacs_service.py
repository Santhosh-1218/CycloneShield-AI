import time
import logging
from typing import Dict, Any, List, Optional, Tuple
import httpx
from app.schemas.provenance import create_provenance

logger = logging.getLogger("cycloneshield-gdacs")

GDACS_MAP_API_URL = "https://www.gdacs.org/gdacsapi/api/Events/geteventlist/map?eventtype=TC"

def _extract_lon_lat(feat: Dict[str, Any]) -> Optional[Tuple[float, float]]:
    """
    Safely extracts (longitude, latitude) float tuple from GDACS Feature or BBox.
    MapLibre coordinates format is ALWAYS [longitude, latitude].
    """
    geom = feat.get("geometry", {})
    gtype = geom.get("type", "")
    coords = geom.get("coordinates", [])

    if gtype == "Point" and isinstance(coords, list) and len(coords) >= 2:
        if isinstance(coords[0], (int, float)) and isinstance(coords[1], (int, float)):
            return float(coords[0]), float(coords[1])

    # Check bbox if coordinates nested or polygon
    props = feat.get("properties", {})
    bbox = feat.get("bbox") or props.get("bbox")
    if isinstance(bbox, list) and len(bbox) >= 4:
        try:
            min_lon, min_lat, max_lon, max_lat = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])
            return (min_lon + max_lon) / 2.0, (min_lat + max_lat) / 2.0
        except (ValueError, TypeError):
            pass

    return None

def normalize_gdacs_cyclone_response(data: Any, retrieved_at: str = "") -> Dict[str, Any]:
    """
    Pure synchronous normalization of GDACS API response payload.
    Ensures GDACS normalization can be tested deterministically without external network calls.
    """
    if not retrieved_at:
        retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    if not isinstance(data, dict):
        return {
            "available": False,
            "hasActiveCyclone": False,
            "status": "UNAVAILABLE",
            "message": "CYCLONE DATA UNAVAILABLE",
            "reason": "Malformed or non-dict GDACS response data",
            "source": "GDACS",
            "retrievedAt": retrieved_at,
            "storm": None,
            "geojson": {"type": "FeatureCollection", "features": []}
        }

    features = data.get("features", []) if isinstance(data, dict) else []
    active_events = []
    for feat in features:
        props = feat.get("properties", {})
        is_current = str(props.get("iscurrent", "")).lower() in ("true", "1")
        event_type = str(props.get("eventtype", "")).upper()
        if is_current and event_type == "TC":
            lon_lat = _extract_lon_lat(feat)
            if lon_lat:
                active_events.append((feat, lon_lat))

    if not active_events:
        prov = create_provenance(
            source="GDACS (Global Disaster Alert and Coordination System)",
            provider="GDACS",
            data_type="Tropical Cyclone Event Observations",
            retrieved_at=retrieved_at,
            freshness="Live Stream",
            status="LIVE",
            confidence=0.98,
            is_live=True
        )

        return {
            "available": True,
            "hasActiveCyclone": False,
            "isDemoMode": False,
            "message": "NO ACTIVE CYCLONE DETECTED",
            "reason": "NO ACTIVE CYCLONE DETECTED IN GDACS AUTHORITATIVE FEED",
            "source": "GDACS (Global Disaster Alert and Coordination System)",
            "retrievedAt": retrieved_at,
            "status": "LIVE",
            "storm": None,
            "observedTrack": None,
            "forecastTrack": None,
            "forecastPoints": [],
            "windRadii": [],
            "forecastCone": None,
            "geojson": {"type": "FeatureCollection", "features": []},
            "summary": {
                "activeStormsCount": 0,
                "region": "Global Tropical Cyclone Basins",
                "statusLabel": "NO ACTIVE CYCLONE DETECTED"
            },
            "provenance": prov.model_dump()
        }

    # Selected active event
    selected_feat, (lon, lat) = active_events[0]
    props = selected_feat.get("properties", {})
    event_id = str(props.get("eventid", ""))
    storm_name = props.get("eventname") or props.get("name") or f"Cyclone {event_id}"
    alert_level = props.get("alertlevel") or "Green"
    category = f"Alert Level {alert_level}"
    country = props.get("country") or "Global Waters"

    obs_time = props.get("datemodified") or props.get("fromdate") or retrieved_at

    storm_obj = {
        "id": f"gdacs-{event_id}",
        "name": storm_name,
        "category": category,
        "currentPosition": {"lat": lat, "lon": lon},
        "maxWindSpeedKmh": None,
        "centralPressureHpa": None,
        "movementDirection": None,
        "movementSpeedKmh": None,
        "alertLevel": alert_level,
        "country": country,
        "eventId": event_id
    }

    prov = create_provenance(
        source="GDACS (Global Disaster Alert and Coordination System)",
        provider="GDACS",
        data_type="Tropical Cyclone Event & Track Observations",
        retrieved_at=retrieved_at,
        observed_at=obs_time,
        freshness="Official Alert Stream",
        status="LIVE",
        confidence=0.96,
        is_live=True
    )

    return {
        "available": True,
        "hasActiveCyclone": True,
        "isDemoMode": False,
        "message": f"ACTIVE CYCLONE: {category} '{storm_name}'",
        "source": "GDACS (Global Disaster Alert and Coordination System)",
        "retrievedAt": retrieved_at,
        "status": "LIVE",
        "storm": storm_obj,
        "observedTrack": None,
        "forecastTrack": None,
        "forecastPoints": [{"offsetHours": 0, "coordinates": [lon, lat], "timeLabel": "NOW", "windSpeedKmh": None, "pressureHpa": None}],
        "windRadii": [],
        "forecastCone": None,
        "geojson": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {
                    "id": "current-center",
                    "type": "Current Storm Center",
                    "stormId": storm_obj["id"],
                    "stormName": storm_name,
                    "category": category,
                    "alertLevel": alert_level,
                    "source": "GDACS"
                }
            }]
        },
        "summary": {
            "stormName": storm_name,
            "category": category,
            "currentLocation": {"lat": lat, "lon": lon},
            "alertLevel": alert_level,
            "statusLabel": f"ACTIVE: {category} '{storm_name}'"
        },
        "provenance": prov.model_dump()
    }

async def fetch_gdacs_active_cyclones() -> Dict[str, Any]:
    """
    Fetches active tropical cyclones from GDACS (Global Disaster Alert and Coordination System).
    Processes official GDACS event list & polygon geometries.
    Logs diagnostics with [CYCLONE] prefix as required.
    Strictly uses actual fields returned by GDACS (returns None for unprovided fields).
    NEVER generates fake positions or tracks.
    Returns standard internal Cyclone payload + valid GeoJSON.
    """
    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    logger.info("[CYCLONE] Provider: GDACS")
    logger.info("[CYCLONE] Request started")

    try:
        async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": "CycloneShield-AI/1.0"}) as client:
            resp = await client.get(GDACS_MAP_API_URL)
            logger.info(f"[CYCLONE] HTTP Status: {resp.status_code}")

            if resp.status_code != 200:
                logger.error(f"[CYCLONE] Provider: GDACS | HTTP Status: {resp.status_code} | ERROR: Non-200 response from GDACS API")
                return {
                    "available": False,
                    "hasActiveCyclone": False,
                    "status": "UNAVAILABLE",
                    "message": "CYCLONE DATA UNAVAILABLE",
                    "reason": f"GDACS API returned HTTP {resp.status_code}",
                    "source": "GDACS (Global Disaster Alert and Coordination System)",
                    "retrievedAt": retrieved_at,
                    "storm": None,
                    "geojson": {"type": "FeatureCollection", "features": []}
                }

            data = resp.json()
            features = data.get("features", []) if isinstance(data, dict) else []
            logger.info(f"[CYCLONE] Response received | Events found: {len(features)}")

            # Filter for active/current tropical cyclones
            active_events = []
            for feat in features:
                props = feat.get("properties", {})
                is_current = str(props.get("iscurrent", "")).lower() in ("true", "1")
                event_type = str(props.get("eventtype", "")).upper()
                if is_current and event_type == "TC":
                    lon_lat = _extract_lon_lat(feat)
                    if lon_lat:
                        active_events.append((feat, lon_lat))

            logger.info(f"[CYCLONE] Active cyclones: {len(active_events)}")

            if not active_events:
                prov = create_provenance(
                    source="GDACS (Global Disaster Alert and Coordination System)",
                    provider="GDACS",
                    data_type="Tropical Cyclone Event Observations",
                    retrieved_at=retrieved_at,
                    freshness="Live Stream",
                    status="LIVE",
                    confidence=0.98,
                    is_live=True
                )

                logger.info("[CYCLONE] Normalization: SUCCESS | No active cyclones currently detected")
                logger.info("[CYCLONE] GeoJSON generation: SUCCESS")

                return {
                    "available": True,
                    "hasActiveCyclone": False,
                    "isDemoMode": False,
                    "message": "NO ACTIVE CYCLONE DETECTED",
                    "reason": "NO ACTIVE CYCLONE DETECTED IN GDACS AUTHORITATIVE FEED",
                    "source": "GDACS (Global Disaster Alert and Coordination System)",
                    "retrievedAt": retrieved_at,
                    "status": "LIVE",
                    "storm": None,
                    "observedTrack": None,
                    "forecastTrack": None,
                    "forecastPoints": [],
                    "windRadii": [],
                    "forecastCone": None,
                    "geojson": {"type": "FeatureCollection", "features": []},
                    "summary": {
                        "activeStormsCount": 0,
                        "region": "Global Tropical Cyclone Basins",
                        "statusLabel": "NO ACTIVE CYCLONE DETECTED"
                    },
                    "provenance": prov.model_dump()
                }

            # Pick primary active storm (prefer North Indian Ocean / APAC or first active)
            selected_pair = active_events[0]
            for feat, (c_lon, c_lat) in active_events:
                if -15.0 <= c_lat <= 35.0 and 45.0 <= c_lon <= 115.0:
                    selected_pair = (feat, (c_lon, c_lat))
                    break

            selected_feat, (lon, lat) = selected_pair

            # Validate coordinates [longitude, latitude]
            if not (-180.0 <= lon <= 180.0 and -90.0 <= lat <= 90.0):
                logger.error(f"[CYCLONE] Invalid coordinates received: [{lon}, {lat}]")
                return {
                    "available": False,
                    "hasActiveCyclone": False,
                    "status": "UNAVAILABLE",
                    "message": "CYCLONE DATA UNAVAILABLE",
                    "reason": "Invalid cyclone coordinates returned by GDACS feed",
                    "source": "GDACS",
                    "retrievedAt": retrieved_at,
                    "geojson": {"type": "FeatureCollection", "features": []}
                }

            props = selected_feat.get("properties", {})
            event_id = str(props.get("eventid", ""))
            storm_name = props.get("eventname") or props.get("name") or f"Cyclone {event_id}"
            alert_level = props.get("alertlevel") or "Green"
            category = f"Alert Level {alert_level}"
            country = props.get("country") or "Global Waters"

            # Severity data (max wind speed if provided)
            severity = props.get("severitydata", {})
            max_wind_kmh = None
            if isinstance(severity, dict) and severity.get("severity") is not None:
                try:
                    max_wind_kmh = float(severity["severity"])
                except (ValueError, TypeError):
                    max_wind_kmh = None

            obs_time = props.get("datemodified") or props.get("fromdate") or retrieved_at

            storm_obj = {
                "id": f"gdacs-{event_id}",
                "name": storm_name,
                "category": category,
                "currentPosition": {"lat": lat, "lon": lon},
                "maxWindSpeedKmh": max_wind_kmh,
                "centralPressureHpa": None,
                "movementDirection": None,
                "movementSpeedKmh": None,
                "alertLevel": alert_level,
                "country": country,
                "eventId": event_id
            }

            # Fetch detailed geometries from GDACS polygon endpoint if URL provided
            geometry_url = props.get("url", {}).get("geometry") if isinstance(props.get("url"), dict) else None
            detail_features: List[Dict[str, Any]] = []

            if geometry_url:
                try:
                    geom_resp = await client.get(geometry_url)
                    if geom_resp.status_code == 200:
                        geom_json = geom_resp.json()
                        if isinstance(geom_json, dict) and "features" in geom_json:
                            detail_features = geom_json["features"]
                except Exception as ex:
                    logger.warning(f"[CYCLONE] Failed to fetch detailed geometry from GDACS: {ex}")

            # Construct GeoJSON FeatureCollection with MapLibre coordinates [longitude, latitude]
            geojson_features: List[Dict[str, Any]] = []

            # 1. Storm Center Point Feature
            geojson_features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "id": "current-center",
                    "type": "Current Storm Center",
                    "stormId": storm_obj["id"],
                    "stormName": storm_name,
                    "category": category,
                    "windSpeedKmh": max_wind_kmh,
                    "pressureHpa": None,
                    "alertLevel": alert_level,
                    "source": "GDACS (Global Disaster Alert and Coordination System)",
                    "observationTime": obs_time
                }
            })

            # Process detailed GDACS tracks & polygons
            obs_track_coords = []
            fc_track_coords = []
            forecast_pts = [{
                "offsetHours": 0,
                "coordinates": [lon, lat],
                "timeLabel": "NOW (Observed)",
                "windSpeedKmh": max_wind_kmh,
                "pressureHpa": None
            }]

            for df in detail_features:
                d_geom = df.get("geometry", {})
                d_type = d_geom.get("type")
                d_props = df.get("properties", {})
                d_coords = d_geom.get("coordinates", [])

                if d_type == "LineString" and isinstance(d_coords, list) and d_coords:
                    is_forecast = d_props.get("forecast") is True or "forecast" in str(d_props.get("Class", "")).lower()
                    if is_forecast:
                        fc_track_coords.extend(d_coords)
                    else:
                        obs_track_coords.extend(d_coords)
                elif d_type == "Polygon" and isinstance(d_coords, list) and d_coords:
                    geojson_features.append({
                        "type": "Feature",
                        "geometry": d_geom,
                        "properties": {
                            "id": "forecast-cone",
                            "type": "Warning / Impact Polygon",
                            "stormId": storm_obj["id"],
                            "stormName": storm_name,
                            "alertLevel": alert_level,
                            "fillColor": "#ef4444" if alert_level == "Red" else ("#f59e0b" if alert_level == "Orange" else "#22c55e"),
                            "fillOpacity": 0.2
                        }
                    })

            # Add observed track Feature if valid
            obs_track = None
            if len(obs_track_coords) > 1:
                obs_track = {"type": "LineString", "coordinates": obs_track_coords}
                geojson_features.append({
                    "type": "Feature",
                    "geometry": obs_track,
                    "properties": {
                        "id": "observed-track",
                        "type": "Observed Track",
                        "style": "solid",
                        "color": "#ef4444",
                        "stormId": storm_obj["id"],
                        "stormName": storm_name,
                        "source": "GDACS"
                    }
                })

            # Add forecast track Feature if valid
            fc_track = None
            if len(fc_track_coords) > 1:
                fc_track = {"type": "LineString", "coordinates": fc_track_coords}
                geojson_features.append({
                    "type": "Feature",
                    "geometry": fc_track,
                    "properties": {
                        "id": "forecast-track",
                        "type": "Forecast Track",
                        "style": "dashed",
                        "color": "#f97316",
                        "stormId": storm_obj["id"],
                        "stormName": storm_name,
                        "source": "GDACS"
                    }
                })

            # Generate forecast points from forecast track if points exist
            if fc_track_coords:
                for idx, pt_coords in enumerate(fc_track_coords):
                    if isinstance(pt_coords, list) and len(pt_coords) >= 2:
                        offset_h = (idx + 1) * 6
                        f_pt = {
                            "offsetHours": offset_h,
                            "coordinates": [float(pt_coords[0]), float(pt_coords[1])],
                            "timeLabel": f"+{offset_h}h",
                            "windSpeedKmh": None,
                            "pressureHpa": None
                        }
                        forecast_pts.append(f_pt)
                        geojson_features.append({
                            "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [float(pt_coords[0]), float(pt_coords[1])]},
                            "properties": {
                                "id": f"forecast-pt-{offset_h}h",
                                "type": "Forecast Position",
                                "offsetHours": offset_h,
                                "timeLabel": f"+{offset_h}h",
                                "stormId": storm_obj["id"],
                                "stormName": storm_name,
                                "windSpeedKmh": None,
                                "pressureHpa": None,
                                "source": "GDACS"
                            }
                        })

            prov = create_provenance(
                source="GDACS (Global Disaster Alert and Coordination System)",
                provider="GDACS",
                data_type="Tropical Cyclone Event & Track Observations",
                retrieved_at=retrieved_at,
                observed_at=obs_time,
                freshness="Official Alert Stream",
                status="LIVE",
                confidence=0.96,
                is_live=True,
                is_forecast=bool(fc_track_coords)
            )

            logger.info(f"[CYCLONE] Normalization: SUCCESS | Storm '{storm_name}' processed")
            logger.info(f"[CYCLONE] GeoJSON generation: SUCCESS | Features created: {len(geojson_features)}")

            return {
                "available": True,
                "hasActiveCyclone": True,
                "isDemoMode": False,
                "message": f"ACTIVE CYCLONE: {category} '{storm_name}'",
                "source": "GDACS (Global Disaster Alert and Coordination System)",
                "retrievedAt": retrieved_at,
                "status": "LIVE",
                "storm": storm_obj,
                "observedTrack": obs_track,
                "forecastTrack": fc_track,
                "forecastPoints": forecast_pts,
                "windRadii": [],
                "forecastCone": None,
                "geojson": {
                    "type": "FeatureCollection",
                    "features": geojson_features
                },
                "summary": {
                    "stormName": storm_name,
                    "category": category,
                    "currentLocation": {"lat": lat, "lon": lon},
                    "maxWindSpeedKmh": max_wind_kmh,
                    "centralPressureHpa": None,
                    "alertLevel": alert_level,
                    "statusLabel": f"ACTIVE: {category} '{storm_name}'"
                },
                "provenance": prov.model_dump()
            }

    except Exception as e:
        logger.error(f"[CYCLONE] Provider: GDACS | ERROR: Exception during request/processing: {str(e)}")
        return {
            "available": False,
            "hasActiveCyclone": False,
            "status": "UNAVAILABLE",
            "message": "CYCLONE DATA UNAVAILABLE",
            "reason": f"GDACS API connection error: {str(e)}",
            "source": "GDACS",
            "retrievedAt": retrieved_at,
            "storm": None,
            "geojson": {"type": "FeatureCollection", "features": []}
        }
