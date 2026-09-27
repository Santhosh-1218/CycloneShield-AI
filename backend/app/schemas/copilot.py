from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context_data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    available: bool
    source: str
    retrievedAt: str
    status: str
    reply: str
