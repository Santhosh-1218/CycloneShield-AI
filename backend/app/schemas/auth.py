from pydantic import BaseModel
from typing import Optional

class VerifyTokenRequest(BaseModel):
    id_token: str

class UserProfileResponse(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    email_verified: bool = False
