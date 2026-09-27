from typing import Dict, Any, List
from app.risk.hazard import calculate_hazard_score
from app.risk.exposure import calculate_exposure_score
from app.risk.vulnerability import calculate_vulnerability_score

def categorize_risk(score: float) -> str:
    """
    Standard risk level thresholds:
      - 0.00 to 0.24: Low
      - 0.25 to 0.49: Moderate
      - 0.50 to 0.74: High
      - 0.75 to 1.00: Very High
    """
    if score >= 0.75:
        return "Very High"
    elif score >= 0.50:
        return "High"
    elif score >= 0.25:
        return "Moderate"
    else:
        return "Low"

def compute_overall_risk(
    hazard_data: Dict[str, Any],
    exposure_data: Dict[str, Any],
    vulnerability_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Combines Hazard (H), Exposure (E), Vulnerability (V) into total Risk Index R.
    Uses geometric blend R = H^0.45 * E^0.30 * V^0.25 to ensure all 3 components contribute proportionally.
    """
    h_score = hazard_data["score"]
    e_score = exposure_data["score"]
    v_score = vulnerability_data["score"]

    # Geometric weighted formula for risk calculation
    # Ensure minimum non-zero baseline so moderate hazard on high exposure doesn't collapse to 0
    h_eff = max(0.01, h_score)
    e_eff = max(0.01, e_score)
    v_eff = max(0.01, v_score)

    raw_risk = (h_eff ** 0.45) * (e_eff ** 0.30) * (v_eff ** 0.25)
    overall_score = round(max(0.0, min(1.0, raw_risk)), 4)
    category = categorize_risk(overall_score)

    # Generate human-readable explainable risk factors
    explainable_factors: List[Dict[str, Any]] = []

    # Hazard drivers
    h_sub = hazard_data["sub_factors"]
    if h_sub["wind_speed_kmh"] >= 120:
        explainable_factors.append({
            "factor": "Severe Wind Speed",
            "impact": "High",
            "description": f"Modeled sustained winds of {h_sub['wind_speed_kmh']} km/h pose severe structural risk."
        })
    elif h_sub["wind_speed_kmh"] >= 65:
        explainable_factors.append({
            "factor": "Moderate Tropical Storm Winds",
            "impact": "Medium",
            "description": f"Sustained winds of {h_sub['wind_speed_kmh']} km/h may cause tree uprooting and power outages."
        })

    if h_sub["rainfall_24h_mm"] >= 150:
        explainable_factors.append({
            "factor": "Heavy Downpour / Precipitation",
            "impact": "High",
            "description": f"Accumulated 24-hour rainfall of {h_sub['rainfall_24h_mm']} mm significantly elevates flood risk."
        })

    if h_sub["storm_surge_m"] >= 2.0:
        explainable_factors.append({
            "factor": "Critical Storm Surge Threat",
            "impact": "High",
            "description": f"Estimated storm surge of {h_sub['storm_surge_m']}m threatens low-lying coastal zones."
        })

    # Exposure drivers
    e_sub = exposure_data["sub_factors"]
    if e_sub["population_density"] >= 3000:
        explainable_factors.append({
            "factor": "High Population Density",
            "impact": "High",
            "description": f"Dense population area (~{int(e_sub['population_density'])} people/km²) increases human exposure."
        })

    if e_sub["infrastructure_count"] >= 5:
        explainable_factors.append({
            "factor": "Concentrated Critical Infrastructure",
            "impact": "Medium",
            "description": f"Cluster of {e_sub['infrastructure_count']} critical facilities (hospitals/shelters/power) in hazard zone."
        })

    # Vulnerability drivers
    v_sub = vulnerability_data["sub_factors"]
    if v_sub["elevation_m"] <= 10.0:
        explainable_factors.append({
            "factor": "Low-Lying Coastal Terrain",
            "impact": "High",
            "description": f"Elevation of {v_sub['elevation_m']}m above sea level increases vulnerability to inundation."
        })

    if v_sub["coastal_distance_km"] <= 15.0:
        explainable_factors.append({
            "factor": "Immediate Coastal Proximity",
            "impact": "High",
            "description": f"Location is within {v_sub['coastal_distance_km']}km of direct coastline landfall impact."
        })

    if not explainable_factors:
        explainable_factors.append({
            "factor": "Baseline Environmental Exposure",
            "impact": "Low",
            "description": "Risk metrics are within manageable operational thresholds for this zone."
        })

    return {
        "score": overall_score,
        "category": category,
        "hazard_score": h_score,
        "exposure_score": e_score,
        "vulnerability_score": v_score,
        "explainable_factors": explainable_factors,
        "hazard_details": hazard_data,
        "exposure_details": exposure_data,
        "vulnerability_details": vulnerability_data
    }
