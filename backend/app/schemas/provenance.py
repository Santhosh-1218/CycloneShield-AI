from typing import Optional
from pydantic import BaseModel

class DataProvenance(BaseModel):
    source: str
    provider: str
    dataType: str
    observedAt: Optional[str] = None
    retrievedAt: str
    freshness: str
    status: str  # LIVE, FORECAST, SATELLITE, MODELED, HISTORICAL, UNAVAILABLE
    confidence: Optional[float] = None  # 0.0 - 1.0
    isLive: bool = False
    isForecast: bool = False
    isModeled: bool = False

def create_provenance(
    source: str,
    provider: str,
    data_type: str,
    retrieved_at: str,
    observed_at: Optional[str] = None,
    freshness: str = "Live Observation",
    status: str = "LIVE",
    confidence: Optional[float] = 0.9,
    is_live: bool = True,
    is_forecast: bool = False,
    is_modeled: bool = False
) -> DataProvenance:
    return DataProvenance(
        source=source,
        provider=provider,
        dataType=data_type,
        observedAt=observed_at or retrieved_at,
        retrievedAt=retrieved_at,
        freshness=freshness,
        status=status,
        confidence=confidence,
        isLive=is_live,
        isForecast=is_forecast,
        isModeled=is_modeled
    )
