"""
Pydantic schemas for session management
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class SessionResponse(BaseModel):
    """Response for session creation/info"""
    session_id: str = Field(..., description="Unique session identifier")
    vehicle_id: int = Field(..., description="Vehicle identifier")
    race_name: str = Field(..., description="Race name/identifier")
    created_at: datetime = Field(..., description="Session creation timestamp")
    status: str = Field(..., description="Session status (active, closed)")

    class Config:
        schema_extra = {
            "example": {
                "session_id": "race1_2025_01",
                "vehicle_id": 1,
                "race_name": "Race 1",
                "created_at": "2025-01-15T14:30:00",
                "status": "active"
            }
        }


class SessionErrorResponse(BaseModel):
    """Error response for session-related errors"""
    error: str = Field(..., description="Error message")
    session_id: Optional[str] = Field(None, description="Associated session ID if available")
    timestamp: datetime = Field(..., description="Error timestamp")
