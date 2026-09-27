import logging
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import auth, credentials
from app.core.config import settings

logger = logging.getLogger("cycloneshield-auth")

# Initialize Firebase Admin SDK if credentials exist or app not initialized
def initialize_firebase():
    if not firebase_admin._apps:
        try:
            if settings.FIREBASE_CREDENTIALS_PATH and settings.FIREBASE_CREDENTIALS_PATH.strip():
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin initialized with service account.")
            else:
                # Default app initialization (can pick up GOOGLE_APPLICATION_CREDENTIALS env var)
                firebase_admin.initialize_app()
                logger.info("Firebase Admin initialized with default credentials.")
        except Exception as e:
            logger.warning(f"Firebase Admin SDK initialization skipped or failed: {e}. Token verification will run in mock/placeholder mode for Phase 1.")

def verify_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies Firebase ID token. Returns decoded token claims or None if invalid.
    """
    try:
        if not firebase_admin._apps:
            initialize_firebase()
        
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"Failed to verify Firebase token: {e}")
        return None
