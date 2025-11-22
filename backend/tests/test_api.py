"""
Test suite for F1 Telemetry Prediction API
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealth:
    """Health check tests"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestSessionManagement:
    """Session management tests"""
    
    def test_create_session(self):
        """Test session creation"""
        response = client.post("/api/session/create?vehicle_id=1&race_name=Test%20Race")
        assert response.status_code == 201
        data = response.json()
        assert "session_id" in data
        assert data["vehicle_id"] == 1
        assert data["status"] == "active"
        return data["session_id"]
    
    def test_get_session(self):
        """Test get session info"""
        # Create session first
        create_response = client.post("/api/session/create?vehicle_id=1&race_name=Test")
        session_id = create_response.json()["session_id"]
        
        # Get session
        response = client.get(f"/api/session/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
    
    def test_get_nonexistent_session(self):
        """Test getting non-existent session"""
        response = client.get("/api/session/nonexistent")
        assert response.status_code == 404
    
    def test_close_session(self):
        """Test closing a session"""
        # Create session
        create_response = client.post("/api/session/create?vehicle_id=1&race_name=Test")
        session_id = create_response.json()["session_id"]
        
        # Close session
        response = client.post(f"/api/session/{session_id}/close")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "closed"


class TestPredictions:
    """Prediction endpoint tests"""
    
    @pytest.fixture
    def sample_data(self):
        """Sample telemetry data"""
        return {
            "session_id": "test_session",
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
    
    def test_predict_lap_time_invalid_session(self, sample_data):
        """Test lap time prediction with invalid session"""
        response = client.post("/api/predict/lap-time", json=sample_data)
        assert response.status_code == 404
    
    def test_predict_pit_invalid_session(self, sample_data):
        """Test pit prediction with invalid session"""
        response = client.post("/api/predict/pit", json=sample_data)
        assert response.status_code == 404
    
    def test_predict_tire_invalid_session(self, sample_data):
        """Test tire prediction with invalid session"""
        response = client.post("/api/predict/tire", json=sample_data)
        assert response.status_code == 404
    
    def test_predict_all_invalid_session(self, sample_data):
        """Test all predictions with invalid session"""
        response = client.post("/api/predict/all", json=sample_data)
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
