"""
Example client script to interact with F1 Telemetry Prediction API
Demonstrates all API endpoints with sample data
"""
import requests
import json
from typing import Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_BASE_URL = "http://localhost:8000/api"


class F1TelemetryClient:
    """Client for F1 Telemetry API"""
    
    def __init__(self, base_url: str = API_BASE_URL):
        """Initialize client"""
        self.base_url = base_url
        self.session_id = None
    
    def create_session(self, vehicle_id: int, race_name: str = "Race 1") -> Dict[str, Any]:
        """Create new session"""
        url = f"{self.base_url}/session/create"
        params = {"vehicle_id": vehicle_id, "race_name": race_name}
        
        response = requests.post(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        self.session_id = data["session_id"]
        logger.info(f"Created session: {self.session_id}")
        return data
    
    def get_session_info(self, session_id: str = None) -> Dict[str, Any]:
        """Get session information"""
        session_id = session_id or self.session_id
        url = f"{self.base_url}/session/{session_id}"
        
        response = requests.get(url)
        response.raise_for_status()
        
        logger.info(f"Retrieved session info for {session_id}")
        return response.json()
    
    def predict_lap_time(self, telemetry: Dict[str, Any], session_id: str = None) -> Dict[str, Any]:
        """Predict lap time"""
        session_id = session_id or self.session_id
        telemetry['session_id'] = session_id
        
        url = f"{self.base_url}/predict/lap-time"
        response = requests.post(url, json=telemetry)
        response.raise_for_status()
        
        logger.info("Lap time prediction completed")
        return response.json()
    
    def predict_pit(self, telemetry: Dict[str, Any], session_id: str = None) -> Dict[str, Any]:
        """Predict pit imminent"""
        session_id = session_id or self.session_id
        telemetry['session_id'] = session_id
        
        url = f"{self.base_url}/predict/pit"
        response = requests.post(url, json=telemetry)
        response.raise_for_status()
        
        logger.info("Pit imminent prediction completed")
        return response.json()
    
    def predict_tire(self, telemetry: Dict[str, Any], session_id: str = None) -> Dict[str, Any]:
        """Predict tire compound"""
        session_id = session_id or self.session_id
        telemetry['session_id'] = session_id
        
        url = f"{self.base_url}/predict/tire"
        response = requests.post(url, json=telemetry)
        response.raise_for_status()
        
        logger.info("Tire compound prediction completed")
        return response.json()
    
    def predict_all(self, telemetry: Dict[str, Any], session_id: str = None) -> Dict[str, Any]:
        """Make all predictions"""
        session_id = session_id or self.session_id
        telemetry['session_id'] = session_id
        
        url = f"{self.base_url}/predict/all"
        response = requests.post(url, json=telemetry)
        response.raise_for_status()
        
        logger.info("All predictions completed")
        return response.json()
    
    def get_predictions(self, session_id: str = None) -> Dict[str, Any]:
        """Get all predictions for a session"""
        session_id = session_id or self.session_id
        url = f"{self.base_url}/session/{session_id}/predictions"
        
        response = requests.get(url)
        response.raise_for_status()
        
        logger.info(f"Retrieved {response.json()['prediction_count']} predictions")
        return response.json()
    
    def close_session(self, session_id: str = None) -> Dict[str, Any]:
        """Close session"""
        session_id = session_id or self.session_id
        url = f"{self.base_url}/session/{session_id}/close"
        
        response = requests.post(url)
        response.raise_for_status()
        
        logger.info(f"Closed session {session_id}")
        return response.json()


def get_sample_telemetry() -> Dict[str, Any]:
    """Get sample telemetry data"""
    return {
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


def main():
    """Main demo function"""
    logger.info("Starting F1 Telemetry API Client Demo")
    logger.info("=" * 60)
    
    try:
        # Initialize client
        client = F1TelemetryClient()
        
        # Step 1: Create session
        logger.info("\n[1] Creating Session")
        logger.info("-" * 60)
        session = client.create_session(vehicle_id=1, race_name="Monaco Grand Prix")
        print(json.dumps(session, indent=2, default=str))
        
        # Step 2: Get session info
        logger.info("\n[2] Getting Session Info")
        logger.info("-" * 60)
        session_info = client.get_session_info()
        print(json.dumps(session_info, indent=2, default=str))
        
        # Step 3: Make predictions
        telemetry = get_sample_telemetry()
        
        logger.info("\n[3] Making Individual Predictions")
        logger.info("-" * 60)
        
        # Lap time prediction
        logger.info("\n  a) Lap Time Prediction")
        lap_time = client.predict_lap_time(telemetry)
        print(json.dumps(lap_time, indent=2))
        
        # Pit prediction
        logger.info("\n  b) Pit Imminent Prediction")
        pit = client.predict_pit(telemetry)
        print(json.dumps(pit, indent=2))
        
        # Tire prediction
        logger.info("\n  c) Tire Compound Prediction")
        tire = client.predict_tire(telemetry)
        print(json.dumps(tire, indent=2))
        
        # Step 4: Make all predictions
        logger.info("\n[4] Making All Predictions at Once")
        logger.info("-" * 60)
        all_predictions = client.predict_all(telemetry)
        print(json.dumps(all_predictions, indent=2))
        
        # Step 5: Get session predictions
        logger.info("\n[5] Retrieving Session Predictions")
        logger.info("-" * 60)
        predictions = client.get_predictions()
        print(json.dumps(predictions, indent=2, default=str))
        
        # Step 6: Close session
        logger.info("\n[6] Closing Session")
        logger.info("-" * 60)
        closed = client.close_session()
        print(json.dumps(closed, indent=2, default=str))
        
        logger.info("\n" + "=" * 60)
        logger.info("Demo completed successfully!")
        
    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to API. Make sure the server is running.")
        logger.error("Start the server with: python -m uvicorn app.main:app --reload")
    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {e}")
    except Exception as e:
        logger.error(f"Error: {e}")


if __name__ == "__main__":
    main()
