from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class RiskContextInput(BaseModel):
    location: str
    lat: float
    lon: float
    risk_score: float
    risk_category: str
    hazard_score: float
    exposure_score: float
    vulnerability_score: float
    population_exposure: int
    hospitals_exposed: int
    roads_exposed: int
    factors: Optional[List[str]] = []

class AdvisoryGenerateRequest(BaseModel):
    context: RiskContextInput
    language: Optional[str] = "en"

class AdvisoryTranslateRequest(BaseModel):
    title: str
    message: str
    recommended_actions: List[str]
    target_language: str  # 'te' (Telugu), 'hi' (Hindi), 'en' (English)

class AdvisoryResponse(BaseModel):
    id: str
    title: str
    location: str
    risk_category: str
    risk_score: float
    message: str
    recommended_actions: List[str]
    language: str
    status: str  # DRAFT, REVIEWED, APPROVED, ARCHIVED
    created_at: str
    sources: List[str]
