from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class RiskAssessmentQuery(BaseModel):
    lat: float
    lon: float
    radius_km: Optional[float] = 25.0

class SimulationRequest(BaseModel):
    center_lat: float
    center_lon: float
    wind_speed_kmh: float
    rainfall_24h_mm: float
    storm_surge_m: float
    central_pressure_hpa: Optional[float] = 970.0
    radius_km: Optional[float] = 50.0

class ExposureQuery(BaseModel):
    lat: float
    lon: float
    radius_km: Optional[float] = 25.0
