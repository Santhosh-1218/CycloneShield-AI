import time
from typing import Dict, Any

def get_demo_cyclone_scenario(lat: float = 16.9891, lon: float = 82.2475) -> Dict[str, Any]:
    """
    Provides a pre-loaded realistic storm scenario for live hackathon demonstration purposes.
    Isolates demo mode completely and attaches explicit DEMO MODE provenance labels.
    Returns canonical CycloneResponse schema structure.
    """
    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # Realistic track approaching Kakinada, Andhra Pradesh
    observed_coords = [
        [85.2, 13.8],
        [84.1, 14.9],
        [83.0, 16.0],
        [82.25, 16.98]
    ]

    forecast_points = [
        {"offsetHours": 0, "coordinates": [82.25, 16.98], "timeLabel": "NOW", "windSpeedKmh": 130, "pressureHpa": 970},
        {"offsetHours": 3, "coordinates": [81.85, 17.35], "timeLabel": "+3h", "windSpeedKmh": 135, "pressureHpa": 968},
        {"offsetHours": 6, "coordinates": [81.40, 17.75], "timeLabel": "+6h", "windSpeedKmh": 140, "pressureHpa": 965},
        {"offsetHours": 12, "coordinates": [80.70, 18.30], "timeLabel": "+12h", "windSpeedKmh": 110, "pressureHpa": 978},
        {"offsetHours": 24, "coordinates": [79.80, 19.10], "timeLabel": "+24h", "windSpeedKmh": 75, "pressureHpa": 990}
    ]

    forecast_coords = [p["coordinates"] for p in forecast_points]

    # Uncertainty cone coordinates polygon
    cone_coords = [[
        [82.25, 16.98],
        [82.10, 17.45],
        [81.80, 18.00],
        [81.20, 18.70],
        [80.20, 19.50],
        [79.40, 18.70],
        [80.20, 17.90],
        [81.00, 17.20],
        [81.60, 16.70],
        [82.25, 16.98]
    ]]

    obs_track = {
        "type": "LineString",
        "coordinates": observed_coords
    }

    fc_track = {
        "type": "LineString",
        "coordinates": forecast_coords
    }

    forecast_cone = {
        "type": "Polygon",
        "coordinates": cone_coords
    }

    storm_obj = {
        "id": "demo-storm-mocha",
        "name": "MOCHA (Demo Scenario)",
        "category": "Very Severe Cyclonic Storm",
        "currentPosition": {"lat": 16.98, "lon": 82.25},
        "maxWindSpeedKmh": 130.0,
        "centralPressureHpa": 970.0,
        "movementDirection": "North-West",
        "movementSpeedKmh": 16.0
    }

    features = [
        # Uncertainty cone
        {
            "type": "Feature",
            "geometry": forecast_cone,
            "properties": {
                "id": "forecast-cone",
                "type": "Forecast Cone of Uncertainty",
                "stormId": "demo-storm-mocha",
                "stormName": "MOCHA",
                "fillColor": "#f59e0b",
                "fillOpacity": 0.15
            }
        },
        # Observed track
        {
            "type": "Feature",
            "geometry": obs_track,
            "properties": {
                "id": "observed-track",
                "type": "Observed Track",
                "style": "solid",
                "color": "#ef4444",
                "stormId": "demo-storm-mocha",
                "stormName": "MOCHA (Demo Scenario)"
            }
        },
        # Forecast track
        {
            "type": "Feature",
            "geometry": fc_track,
            "properties": {
                "id": "forecast-track",
                "type": "Forecast Track",
                "style": "dashed",
                "color": "#f97316",
                "stormId": "demo-storm-mocha",
                "stormName": "MOCHA (Demo Scenario)"
            }
        },
        # Storm center
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [82.25, 16.98]
            },
            "properties": {
                "id": "current-center",
                "type": "Current Storm Center",
                "stormId": "demo-storm-mocha",
                "stormName": "MOCHA",
                "category": "Very Severe Cyclonic Storm",
                "windSpeedKmh": 130,
                "pressureHpa": 970,
                "movementSpeed": "NW at 16 km/h"
            }
        }
    ]

    for pt in forecast_points:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": pt["coordinates"]
            },
            "properties": {
                "id": f"forecast-pt-{pt['offsetHours']}h",
                "type": "Forecast Position",
                "offsetHours": pt["offsetHours"],
                "timeLabel": pt["timeLabel"],
                "stormId": "demo-storm-mocha",
                "stormName": "MOCHA",
                "windSpeedKmh": pt["windSpeedKmh"],
                "pressureHpa": pt["pressureHpa"]
            }
        })

    prov = {
        "source": "CycloneShield Historical Scenario Archive",
        "provider": "CycloneShield Hackathon Demo Engine",
        "dataType": "Interactive Demo Scenario",
        "observedAt": "2026-09-27T10:00:00Z",
        "retrievedAt": retrieved_at,
        "freshness": "Pre-configured Benchmark Scenario",
        "status": "HISTORICAL",
        "confidence": 1.0,
        "isLive": False,
        "isForecast": True,
        "isModeled": True
    }

    return {
        "available": True,
        "isDemoMode": True,
        "hasActiveCyclone": True,
        "message": "DEMO MODE: Very Severe Cyclonic Storm 'MOCHA' (Scenario)",
        "source": "CycloneShield Demo Simulation Engine",
        "retrievedAt": retrieved_at,
        "status": "DEMO_MODE",
        "storm": storm_obj,
        "observedTrack": obs_track,
        "forecastTrack": fc_track,
        "forecastPoints": forecast_points,
        "windRadii": [],
        "forecastCone": forecast_cone,
        "geojson": {
            "type": "FeatureCollection",
            "features": features
        },
        "summary": {
            "stormName": "MOCHA (Demo Scenario)",
            "category": "Very Severe Cyclonic Storm",
            "currentLocation": {"lat": 16.98, "lon": 82.25},
            "maxWindSpeedKmh": 130,
            "centralPressureHpa": 970,
            "movementDirection": "North-West",
            "movementSpeedKmh": 16,
            "statusLabel": "DEMO SCENARIO ACTIVE"
        },
        "provenance": prov
    }
