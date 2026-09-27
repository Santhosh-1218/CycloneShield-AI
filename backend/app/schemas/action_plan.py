from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class ActionPlanRequest(BaseModel):
    lat: float
    lon: float
    risk_score: float
    risk_category: str
    hazard_score: float
    exposure_score: float
    vulnerability_score: float
    factors: List[str]

class ActionPlanResponse(BaseModel):
    location: str
    risk_category: str
    infrastructure_actions: List[str]
    population_actions: List[str]
    transport_actions: List[str]
    emergency_actions: List[str]
    shelter_actions: List[str]
    monitoring_actions: List[str]
    data_limitations: List[str]
    created_at: str

class DistrictBriefingRequest(BaseModel):
    district_name: str
    lat: float
    lon: float
