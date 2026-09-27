import os
import json
import time

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(LOG_DIR, exist_ok=True)

def _save_local_log(collection_name: str, doc_data: dict) -> dict:
    """Fallback file storage when Firebase Admin SDK is unconfigured."""
    file_path = os.path.join(LOG_DIR, f"{collection_name}.json")
    records = []
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                records = json.load(f)
        except Exception:
            records = []

    doc_data["id"] = f"log_{int(time.time()*1000)}"
    doc_data["timestamp"] = doc_data.get("timestamp", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    records.append(doc_data)

    # Keep latest 100 entries
    records = records[-100:]

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    return doc_data

def log_risk_assessment(lat: float, lon: float, risk_data: dict) -> dict:
    """Logs a risk assessment to Firestore or local fallback."""
    payload = {
        "lat": lat,
        "lon": lon,
        "score": risk_data.get("score"),
        "category": risk_data.get("category"),
        "hazard_score": risk_data.get("hazard_score"),
        "exposure_score": risk_data.get("exposure_score"),
        "vulnerability_score": risk_data.get("vulnerability_score"),
        "factors": [f.get("factor") for f in risk_data.get("explainable_factors", [])],
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    return _save_local_log("risk_assessments", payload)

def log_simulation_run(scenario_data: dict, result_summary: dict) -> dict:
    """Logs a simulation scenario execution."""
    payload = {
        "scenario": scenario_data,
        "result": result_summary,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    return _save_local_log("simulation_runs", payload)

def log_copilot_interaction(prompt: str, response: str, intent: str = "chat") -> dict:
    """Logs disaster copilot interaction."""
    payload = {
        "prompt": prompt,
        "response": response,
        "intent": intent,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    return _save_local_log("copilot_history", payload)

def fetch_risk_history(limit: int = 20) -> list:
    """Fetches past logged risk assessments."""
    file_path = os.path.join(LOG_DIR, "risk_assessments.json")
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            records = json.load(f)
            return list(reversed(records))[:limit]
    except Exception:
        return []
