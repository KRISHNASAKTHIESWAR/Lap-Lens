"""
Pydantic schemas for telemetry data
"""
from pydantic import BaseModel, Field
from typing import Optional


class TelemetryInput(BaseModel):
    """Input schema for telemetry data"""
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

    class Config:
        schema_extra = {
            "example": {
                "vehicle_id": 1,
                "lap": 25,
                "max_speed": 340.5,
                "avg_speed": 280.0,
                "std_speed": 45.2,
                "avg_throttle": 0.75,
                "brake_front_freq": 12,
                "brake_rear_freq": 8,
                "dominant_gear": 6,
                "avg_steer_angle": 5.5,
                "avg_long_accel": 2.1,
                "avg_lat_accel": 3.2,
                "avg_rpm": 11000,
                "rolling_std_lap_time": 0.5,
                "lap_time_delta": 0.3,
                "tire_wear_high": 0.45,
                "air_temp": 25.0,
                "track_temp": 45.0,
                "humidity": 60.0,
                "pressure": 1013.25,
                "wind_speed": 5.0,
                "wind_direction": 90.0,
                "rain": 0.0
            }
        }
