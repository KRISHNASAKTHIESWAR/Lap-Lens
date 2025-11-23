"""
Pydantic schemas for predictions
"""
from pydantic import BaseModel, Field
from typing import Optional


class PredictionRequest(BaseModel):
    """Request for making predictions"""
    session_id: str = Field(..., description="Unique session identifier")
    vehicle_id: int = Field(..., description="Vehicle identifier")
    lap: int = Field(..., description="Lap number")
    max_speed: float = Field(..., description="Maximum speed in lap")
    avg_speed: float = Field(..., description="Average speed in lap")
    std_speed: float = Field(..., description="Speed standard deviation")
    avg_throttle: float = Field(..., description="Average throttle position")
    brake_front_freq: float = Field(..., description="Front brake frequency")
    brake_rear_freq: float = Field(..., description="Rear brake frequency")
    dominant_gear: int = Field(..., description="Most used gear")
    avg_steer_angle: float = Field(..., description="Average steering angle")
    avg_long_accel: float = Field(..., description="Average longitudinal acceleration")
    avg_lat_accel: float = Field(..., description="Average lateral acceleration")
    avg_rpm: float = Field(..., description="Average engine RPM")
    rolling_std_lap_time: float = Field(..., description="Rolling standard deviation of lap time")
    lap_time_delta: float = Field(..., description="Difference from optimal lap time")
    tire_wear_high: float = Field(..., description="Maximum tire wear level")
    air_temp: float = Field(..., description="Air temperature in Celsius")
    track_temp: float = Field(..., description="Track temperature in Celsius")
    humidity: float = Field(..., description="Humidity percentage")
    pressure: float = Field(..., description="Air pressure in hPa")
    wind_speed: float = Field(..., description="Wind speed in km/h")
    wind_direction: float = Field(..., description="Wind direction in degrees")
    rain: float = Field(..., description="Rain level (0-1)")


class LapTimeResponse(BaseModel):
    """Response for lap time prediction"""
    session_id: str = Field(..., description="Session ID")
    vehicle_id: int = Field(..., description="Vehicle ID")
    lap: int = Field(..., description="Lap number")
    predicted_lap_time: float = Field(..., description="Predicted lap time in seconds")
    confidence: float = Field(..., description="Model confidence (0-1)")
    explanation: Optional[str] = Field(None, description="AI-generated explanation of the prediction")

    class Config:
        schema_extra = {
            "example": {
                "session_id": "race1_2025_01",
                "vehicle_id": 1,
                "lap": 25,
                "predicted_lap_time": 83.456,
                "confidence": 0.92,
                "explanation": "The predicted lap time of 83.456s is primarily driven by..."
            }
        }


class PitImminentResponse(BaseModel):
    """Response for pit imminent prediction"""
    session_id: str = Field(..., description="Session ID")
    vehicle_id: int = Field(..., description="Vehicle ID")
    lap: int = Field(..., description="Lap number")
    pit_imminent: bool = Field(..., description="Whether pit stop is imminent")
    probability: float = Field(..., description="Probability of pit (0-1)")
    explanation: Optional[str] = Field(None, description="AI-generated explanation of the prediction")

    class Config:
        schema_extra = {
            "example": {
                "session_id": "race1_2025_01",
                "vehicle_id": 1,
                "lap": 25,
                "pit_imminent": True,
                "probability": 0.78,
                "explanation": "The model predicts pit is imminent because..."
            }
        }


class TireCompoundResponse(BaseModel):
    """Response for tire compound suggestion"""
    session_id: str = Field(..., description="Session ID")
    vehicle_id: int = Field(..., description="Vehicle ID")
    lap: int = Field(..., description="Lap number")
    suggested_compound: str = Field(..., description="Suggested tire compound (SOFT, MEDIUM, HARD)")
    confidence: float = Field(..., description="Confidence score (0-1)")
    explanation: Optional[str] = Field(None, description="AI-generated explanation of the suggestion")

    class Config:
        schema_extra = {
            "example": {
                "session_id": "race1_2025_01",
                "vehicle_id": 1,
                "lap": 25,
                "suggested_compound": "MEDIUM",
                "confidence": 0.85,
                "explanation": "The model recommends MEDIUM compound because..."
            }
        }


class AllPredictionsResponse(BaseModel):
    """Combined response for all predictions"""
    session_id: str = Field(..., description="Session ID")
    vehicle_id: int = Field(..., description="Vehicle ID")
    lap: int = Field(..., description="Lap number")
    lap_time: float = Field(..., description="Predicted lap time in seconds")
    lap_time_confidence: float = Field(..., description="Lap time model confidence")
    pit_imminent: bool = Field(..., description="Whether pit stop is imminent")
    pit_probability: float = Field(..., description="Probability of pit stop")
    tire_compound: str = Field(..., description="Suggested tire compound")
    tire_confidence: float = Field(..., description="Tire compound confidence")

    class Config:
        schema_extra = {
            "example": {
                "session_id": "race1_2025_01",
                "vehicle_id": 1,
                "lap": 25,
                "lap_time": 83.456,
                "lap_time_confidence": 0.92,
                "pit_imminent": True,
                "pit_probability": 0.78,
                "tire_compound": "MEDIUM",
                "tire_confidence": 0.85
            }
        }


class RaceEvent(BaseModel):
    """Single race event (lap-based incident or note)"""
    lap: int = Field(..., description="Lap number when event occurred")
    event: str = Field(..., description="Description of the event")


class RaceStoryRequest(BaseModel):
    """Request for generating a race story"""
    session_id: str = Field(..., description="Unique session identifier")
    vehicle_id: int = Field(..., description="Vehicle identifier")
    race_events: list[RaceEvent] = Field(..., description="List of race events by lap")
    summary_stats: dict = Field(..., description="Race summary statistics")

    class Config:
        schema_extra = {
            "example": {
                "session_id": "race_abc123",
                "vehicle_id": 1,
                "race_events": [
                    {"lap": 1, "event": "Strong start, gained 2 positions"},
                    {"lap": 12, "event": "Tire degradation noticed, lap time dropped"},
                    {"lap": 23, "event": "Pit stop, switched to mediums"}
                ],
                "summary_stats": {
                    "total_laps": 58,
                    "best_lap": 82.456,
                    "avg_lap_time": 85.234,
                    "pit_stops": 2,
                    "max_speed": 310.5,
                    "final_position": 3,
                    "weather_summary": "Clear skies, 25°C track temp",
                    "tire_strategy": "Soft-Medium-Medium"
                }
            }
        }


class RaceStoryResponse(BaseModel):
    """Response containing the generated race story"""
    session_id: str = Field(..., description="Session ID")
    vehicle_id: int = Field(..., description="Vehicle ID")
    story: str = Field(..., description="AI-generated race story")

    class Config:
        schema_extra = {
            "example": {
                "session_id": "race_abc123",
                "vehicle_id": 1,
                "story": "Car #1 delivered a masterclass in racecraft today..."
            }
        }

class RaceStoryRequestAuto(BaseModel):
    """
    Auto-generation request schema for race story.
    The backend will automatically fetch predictions,
    extract events, compute summary stats, and then generate story.
    """
    session_id: str = Field(..., description="Unique session identifier")
    vehicle_id: int = Field(..., description="Vehicle identifier")

    class Config:
        schema_extra = {
            "example": {
                "session_id": "race_ab12cd34ef56",
                "vehicle_id": 1
            }
        }
