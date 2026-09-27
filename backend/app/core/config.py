import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "CycloneShield AI API")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    PORT: int = int(os.getenv("PORT", 8080))

    # Environment variables specified in spec
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "cycloneshield-ai-509618")
    OSM_TILE_URL: str = os.getenv("OSM_TILE_URL", "https://tile.openstreetmap.org/{z}/{x}/{y}.png")
    OVERPASS_URL: str = os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter")
    OSM_API_KEY: str = os.getenv("OSM_API_KEY", "")
    OVERPASS_API_KEY: str = os.getenv("OVERPASS_API_KEY", "")
    OPEN_METEO_BASE_URL: str = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com")
    WEATHER_API_BASE_URL: str = os.getenv("WEATHER_API_BASE_URL", "https://api.open-meteo.com/v1")
    GDACS_API_BASE_URL: str = os.getenv("GDACS_API_BASE_URL", "https://www.gdacs.org/gdacsapi")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Firebase Auth & Cloud Firestore
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")

    # Google Earth Engine Configuration
    EE_PROJECT_ID: str = os.getenv("EE_PROJECT_ID", "cycloneshield-ai-509618")
    EE_SERVICE_ACCOUNT: str = os.getenv("EE_SERVICE_ACCOUNT", "")
    EE_PRIVATE_KEY: str = os.getenv("EE_PRIVATE_KEY", "")

    # Legacy IMD configuration (not used by default in live path)
    IMD_API_BASE_URL: str = os.getenv("IMD_API_BASE_URL", "https://api.imd.gov.in")

settings = Settings()
