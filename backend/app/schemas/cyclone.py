from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.provenance import DataProvenance

class CycloneStorm(BaseModel):
    id: str = Field(..., description="Unique storm identifier")
    name: str = Field(..., description="Storm name e.g. MOCHA, DANA")
    category: str = Field(..., description="Intensity category e.g. Very Severe Cyclonic Storm")
    currentPosition: Dict[str, float] = Field(..., description="Current lat/lon dict")
    maxWindSpeedKmh: Optional[float] = Field(None, description="Max sustained wind speed in km/h")
    centralPressureHpa: Optional[float] = Field(None, description="Central pressure in hPa")
    movementDirection: Optional[str] = Field(None, description="Movement direction e.g. NW")
    movementSpeedKmh: Optional[float] = Field(None, description="Movement speed in km/h")

class CycloneForecastPoint(BaseModel):
    time: Optional[str] = None
    offsetHours: int
    coordinates: List[float]  # [lon, lat]
    windSpeedKmh: Optional[float] = None
    pressureHpa: Optional[float] = None
    timeLabel: Optional[str] = None

class WindRadius(BaseModel):
    speedKt: int
    quadrants: Dict[str, float]  # NE, SE, SW, NW radii in km or nm

class ForecastCone(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class CycloneResponse(BaseModel):
    available: bool
    hasActiveCyclone: bool
    isDemoMode: bool = False
    message: str
    source: str
    retrievedAt: str
    status: str  # LIVE | STALE | DEMO_MODE | UNAVAILABLE
    storm: Optional[CycloneStorm] = None
    observedTrack: Optional[Dict[str, Any]] = None
    forecastTrack: Optional[Dict[str, Any]] = None
    forecastPoints: List[CycloneForecastPoint] = Field(default_factory=list)
    windRadii: List[WindRadius] = Field(default_factory=list)
    forecastCone: Optional[Dict[str, Any]] = None
    geojson: Dict[str, Any]
    summary: Dict[str, Any]
    provenance: DataProvenance
