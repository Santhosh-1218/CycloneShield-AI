import time
from typing import Dict, Any, List

def get_layers_metadata() -> List[Dict[str, Any]]:
    """
    Returns list of all available map layers categorized by group.
    Connected directly to backend endpoints.
    """
    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    return [
        {
            "category": "WEATHER",
            "layers": [
                {"id": "temperature", "name": "Temperature Overlay", "type": "raster", "active": False, "endpoint": "/api/weather"},
                {"id": "rainfall", "name": "Rainfall Accumulation", "type": "heatmap", "active": True, "endpoint": "/api/weather"},
                {"id": "precipitationProb", "name": "Precipitation Probability", "type": "raster", "active": False, "endpoint": "/api/weather/hourly"},
                {"id": "wind", "name": "Wind Vector Speed & Direction", "type": "particles", "active": True, "endpoint": "/api/weather"},
                {"id": "humidity", "name": "Relative Humidity", "type": "raster", "active": False, "endpoint": "/api/weather"},
                {"id": "pressure", "name": "Surface Pressure Contours", "type": "line", "active": False, "endpoint": "/api/weather"}
            ]
        },
        {
            "category": "SATELLITE",
            "layers": [
                {"id": "satelliteImagery", "name": "Sentinel-1 SAR Satellite Observation", "type": "raster", "active": False, "endpoint": "/api/satellite/metadata"},
                {"id": "cloudCover", "name": "Cloud Observation Imagery", "type": "raster", "active": False, "endpoint": "/api/satellite/metadata"}
            ]
        },
        {
            "category": "DISASTER",
            "layers": [
                {"id": "floodIndicator", "name": "Potential Flood Area Inundation", "type": "polygon", "active": True, "endpoint": "/api/flood"},
                {"id": "surfaceWater", "name": "Surface Water Dynamics", "type": "polygon", "active": False, "endpoint": "/api/landcover"},
                {"id": "cycloneTrack", "name": "Cyclone Track & Cone of Uncertainty", "type": "vector", "active": True, "endpoint": "/api/cyclones"},
                {"id": "riskZones", "name": "Disaster Risk Heatmap", "type": "heatmap", "active": True, "endpoint": "/api/risk"}
            ]
        },
        {
            "category": "TERRAIN",
            "layers": [
                {"id": "elevation", "name": "NASADEM Topographical Elevation", "type": "raster", "active": False, "endpoint": "/api/elevation"},
                {"id": "landCover", "name": "Dynamic World Land Cover Classification", "type": "raster", "active": False, "endpoint": "/api/landcover"},
                {"id": "vegetation", "name": "NDVI Vegetation Density", "type": "raster", "active": False, "endpoint": "/api/landcover"}
            ]
        },
        {
            "category": "INFRASTRUCTURE",
            "layers": [
                {"id": "hospitals", "name": "Hospitals & Medical Facilities", "type": "symbol", "active": True, "endpoint": "/api/infrastructure"},
                {"id": "shelters", "name": "Evacuation Cyclone Shelters", "type": "symbol", "active": True, "endpoint": "/api/infrastructure"},
                {"id": "schools", "name": "Schools & Relief Centers", "type": "symbol", "active": False, "endpoint": "/api/infrastructure"},
                {"id": "roads", "name": "Primary Evacuation Roads & Bridges", "type": "line", "active": True, "endpoint": "/api/infrastructure"},
                {"id": "bridges", "name": "Bridges & Coastal Causeways", "type": "symbol", "active": True, "endpoint": "/api/infrastructure"},
                {"id": "buildings", "name": "Built-up Infrastructure Footprints", "type": "polygon", "active": False, "endpoint": "/api/infrastructure"}
            ]
        }
    ]
