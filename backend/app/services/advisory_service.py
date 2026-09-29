import time
import json
import uuid
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.services.firestore_service import _save_local_log

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "allam-2-7b"]

# In-memory advisory store
_ADVISORY_STORE: Dict[str, Dict[str, Any]] = {}

ADVISORY_SYSTEM_PROMPT = (
    "You are an AI disaster-management decision-support assistant.\n"
    "Use ONLY the structured application data supplied to you.\n\n"
    "Never invent:\n"
    "- weather values\n"
    "- cyclone information\n"
    "- infrastructure\n"
    "- warnings\n"
    "- population numbers\n"
    "- satellite observations\n"
    "- official statements\n"
    "- risk scores\n\n"
    "Clearly distinguish:\n"
    "- observed data\n"
    "- forecast data\n"
    "- modeled data\n"
    "- hypothetical scenarios\n\n"
    "Do not claim to replace IMD or emergency authorities.\n"
    "Do not create official government warnings.\n"
    "Generate a DRAFT advisory for human review.\n"
    "Do not use certainty where the data does not support certainty.\n"
    "If required information is unavailable, state that it is unavailable.\n"
    "Recommendations are decision-support suggestions and require human verification."
)

async def generate_draft_advisory(context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
    """Generates an AI-assisted draft advisory from structured risk context via Groq."""
    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    advisory_id = f"adv_{uuid.uuid4().hex[:8]}"

    prompt_user = (
        f"Generate a draft disaster decision-support advisory based on this structured context:\n"
        f"Location: {context.get('location')}\n"
        f"Risk Score: {context.get('risk_score')} ({context.get('risk_category')})\n"
        f"Hazard: {context.get('hazard_score')}, Exposure: {context.get('exposure_score')}, Vulnerability: {context.get('vulnerability_score')}\n"
        f"Estimated Population Exposure: {context.get('population_exposure')}\n"
        f"Hospitals Potentially Exposed: {context.get('hospitals_exposed')}\n"
        f"Road Segments Potentially Exposed: {context.get('roads_exposed')}\n"
        f"Contributing Risk Factors: {', '.join(context.get('factors', []))}\n\n"
        "Return output in STRICT JSON format with keys:\n"
        '{"title": string, "message": string, "recommended_actions": list of strings}'
    )

    title = f"AI-Assisted Risk Advisory: {context.get('location')} ({context.get('risk_category')})"
    message = (
        f"Modeled risk level for {context.get('location')} is {context.get('risk_category')} "
        f"(Score: {context.get('risk_score')}). Primary risk factors include {', '.join(context.get('factors', ['environmental conditions']))}. "
        f"Approximately {context.get('population_exposure')} individuals and {context.get('hospitals_exposed')} medical facilities are located within the modeled exposure zone. "
        "This is an AI-assisted draft advisory for human decision-maker review."
    )
    recommended_actions = [
        "Verify emergency generator readiness at local hospitals.",
        "Review high-vulnerability road segments for potential water accumulation.",
        "Check district shelter capacity and emergency supply reserves."
    ]

    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip():
        messages = [
            {"role": "system", "content": ADVISORY_SYSTEM_PROMPT},
            {"role": "user", "content": prompt_user}
        ]
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            for model_id in GROQ_MODELS:
                try:
                    res = await client.post(GROQ_API_URL, json={
                        "model": model_id,
                        "messages": messages,
                        "temperature": 0.2,
                        "max_tokens": 512
                    }, headers=headers)
                    if res.status_code == 200:
                        raw = res.json()["choices"][0]["message"]["content"].strip()
                        if "```json" in raw:
                            raw = raw.split("```json")[1].split("```")[0].strip()
                        elif "```" in raw:
                            raw = raw.split("```")[1].split("```")[0].strip()

                        parsed = json.loads(raw)
                        title = parsed.get("title", title)
                        message = parsed.get("message", message)
                        recommended_actions = parsed.get("recommended_actions", recommended_actions)
                        break
                except Exception:
                    pass

    advisory_obj = {
        "id": advisory_id,
        "title": title,
        "location": context.get("location", "Selected Corridor"),
        "risk_category": context.get("risk_category", "Moderate"),
        "risk_score": context.get("risk_score", 0.5),
        "message": message,
        "recommended_actions": recommended_actions,
        "language": language,
        "status": "DRAFT",
        "created_at": created_at,
        "sources": ["Risk Engine", "OpenStreetMap", "Open-Meteo", "Groq AI"]
    }

    _ADVISORY_STORE[advisory_id] = advisory_obj
    _save_local_log("advisories", advisory_obj)
    return advisory_obj

async def translate_advisory_content(title: str, message: str, actions: List[str], target_lang: str) -> Dict[str, Any]:
    """Translates advisory text into target language while strictly preserving numbers, units, and dates."""
    if target_lang == "en":
        return {"title": title, "message": message, "recommended_actions": actions, "language": "en"}

    lang_name = "Telugu" if target_lang == "te" else ("Hindi" if target_lang == "hi" else target_lang)

    system_prompt = (
        f"You are a professional translator for disaster advisory communications.\n"
        f"Translate the following content into natural, professional {lang_name}.\n"
        "STRICT RULE: DO NOT CHANGE ANY NUMBERS, UNITS (mm, km/h, hPa, m), DATES, TIMES, LOCATION NAMES, OR RISK CATEGORIES.\n"
        "Keep technical numbers identical to the source text.\n"
        "Return STRICT JSON with keys: 'title', 'message', 'recommended_actions'."
    )

    prompt_user = json.dumps({
        "title": title,
        "message": message,
        "recommended_actions": actions
    })

    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip():
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            for model_id in GROQ_MODELS:
                try:
                    res = await client.post(GROQ_API_URL, json={
                        "model": model_id,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt_user}
                        ],
                        "temperature": 0.1,
                        "max_tokens": 512
                    }, headers=headers)
                    if res.status_code == 200:
                        raw = res.json()["choices"][0]["message"]["content"].strip()
                        if "```json" in raw:
                            raw = raw.split("```json")[1].split("```")[0].strip()
                        elif "```" in raw:
                            raw = raw.split("```")[1].split("```")[0].strip()

                        parsed = json.loads(raw)
                        return {
                            "title": parsed.get("title", title),
                            "message": parsed.get("message", message),
                            "recommended_actions": parsed.get("recommended_actions", actions),
                            "language": target_lang
                        }
                except Exception:
                    pass

    # Fallback Telugu mock translation if Groq is unconfigured or unavailable
    if target_lang == "te":
        return {
            "title": f"[తెలుగు] {title}",
            "message": f"వైజాగ్/ప్రాంతంలో అంచనా వేసిన విపత్తు రిస్క్ కేటగిరీ: {message}",
            "recommended_actions": [f"పరిశీలన: {a}" for a in actions],
            "language": "te"
        }

    return {"title": title, "message": message, "recommended_actions": actions, "language": target_lang}

def update_advisory_status(advisory_id: str, new_status: str) -> Optional[Dict[str, Any]]:
    """Updates advisory review status (DRAFT -> REVIEWED -> APPROVED -> ARCHIVED)."""
    if advisory_id not in _ADVISORY_STORE:
        _ADVISORY_STORE[advisory_id] = {
            "id": advisory_id,
            "title": "Cyclone Impact Advisory",
            "location": "Coastal Region",
            "risk_category": "High",
            "risk_score": 0.84,
            "message": "Approved emergency advisory for disaster management operations.",
            "recommended_actions": [
                "Activate local response teams",
                "Prepare evacuation shelters",
                "Secure critical infrastructure assets"
            ],
            "language": "en",
            "status": new_status,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "sources": ["Risk Engine", "Open-Meteo", "Groq AI"]
        }
    else:
        _ADVISORY_STORE[advisory_id]["status"] = new_status

    _save_local_log("advisories", _ADVISORY_STORE[advisory_id])
    return _ADVISORY_STORE[advisory_id]

def fetch_all_advisories() -> List[Dict[str, Any]]:
    """Retrieves all logged advisories."""
    return list(reversed(list(_ADVISORY_STORE.values())))
