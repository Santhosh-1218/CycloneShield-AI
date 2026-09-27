from typing import Dict, Any, Optional
from app.risk.normalization import normalize_min_max

def calculate_hazard_score(
    wind_speed_kmh: float,
    rainfall_24h_mm: float,
    central_pressure_hpa: Optional[float] = 1013.0,
    storm_surge_m: Optional[float] = 0.0
) -> Dict[str, Any]:
    """
    Computes normalized Hazard Score H in range [0.0, 1.0].
    Weights:
      - Wind speed (0-250 km/h): 0.40
      - Rainfall (0-400 mm): 0.30
      - Central pressure deficit (1013 - P, 0-80 hPa): 0.15
      - Storm Surge (0-6 m): 0.15
    """
    # 1. Wind speed factor (Saffir-Simpson / IMD Cyclone Scale inspiration)
    # IMD Cyclone thresholds: >62 km/h CS, >88 km/h SCS, >118 km/h VSCS, >166 km/h ESCS, >222 km/h Super CS
    wind_norm = normalize_min_max(wind_speed_kmh, min_val=20.0, max_val=220.0)

    # 2. Rainfall factor
    # >200mm is Extremely Heavy Rainfall according to IMD
    rain_norm = normalize_min_max(rainfall_24h_mm, min_val=10.0, max_val=350.0)

    # 3. Pressure deficit factor (standard sea-level pressure 1013 hPa)
    pressure_deficit = max(0.0, 1013.0 - (central_pressure_hpa if central_pressure_hpa is not None else 1013.0))
    pressure_norm = normalize_min_max(pressure_deficit, min_val=0.0, max_val=75.0)

    # 4. Storm surge factor
    surge_norm = normalize_min_max(storm_surge_m if storm_surge_m is not None else 0.0, min_val=0.0, max_val=5.0)

    # Weighted composite hazard score
    score = (0.40 * wind_norm) + (0.30 * rain_norm) + (0.15 * pressure_norm) + (0.15 * surge_norm)
    score = round(max(0.0, min(1.0, score)), 4)

    return {
        "score": score,
        "sub_factors": {
            "wind_speed_kmh": wind_speed_kmh,
            "wind_norm": wind_norm,
            "rainfall_24h_mm": rainfall_24h_mm,
            "rain_norm": rain_norm,
            "central_pressure_hpa": central_pressure_hpa,
            "pressure_norm": pressure_norm,
            "storm_surge_m": storm_surge_m,
            "surge_norm": surge_norm
        }
    }
