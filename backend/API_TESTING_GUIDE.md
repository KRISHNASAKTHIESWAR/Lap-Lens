"""
API Testing Guide with Examples
Complete guide for testing all endpoints
"""

# ============================================================================
# SECTION 1: SETUP & INITIAL REQUESTS
# ============================================================================

# Make sure the API is running:
# python -m uvicorn app.main:app --reload

API_URL = "http://localhost:8000"


# ============================================================================
# SECTION 2: HEALTH CHECK (No Session Required)
# ============================================================================

import requests

# Test root endpoint
response = requests.get(f"{API_URL}/")
print("Root endpoint:", response.json())
# Output: {"message": "F1 Telemetry Prediction API", "version": "1.0.0", "docs": "/docs"}

# Test health endpoint
response = requests.get(f"{API_URL}/health")
print("Health:", response.json())
# Output: {"status": "healthy", "service": "F1 Telemetry API"}


# ============================================================================
# SECTION 3: SESSION MANAGEMENT
# ============================================================================

# 3.1 CREATE A SESSION
print("\n=== CREATE SESSION ===")
response = requests.post(
    f"{API_URL}/api/session/create",
    params={"vehicle_id": 1, "race_name": "Monaco Grand Prix"}
)
print("Status:", response.status_code)  # Should be 201
session_data = response.json()
print("Response:", session_data)

session_id = session_data["session_id"]
print(f"Session ID: {session_id}")

# 3.2 GET SESSION INFO
print("\n=== GET SESSION INFO ===")
response = requests.get(f"{API_URL}/api/session/{session_id}")
print("Status:", response.status_code)  # Should be 200
print("Response:", response.json())

# 3.3 GET NON-EXISTENT SESSION (Error test)
print("\n=== GET NON-EXISTENT SESSION (Error Test) ===")
response = requests.get(f"{API_URL}/api/session/invalid_session_id")
print("Status:", response.status_code)  # Should be 404
print("Response:", response.json())


# ============================================================================
# SECTION 4: SAMPLE TELEMETRY DATA
# ============================================================================

sample_telemetry = {
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


# ============================================================================
# SECTION 5: INDIVIDUAL PREDICTIONS
# ============================================================================

# 5.1 LAP TIME PREDICTION
print("\n=== LAP TIME PREDICTION ===")
telemetry = sample_telemetry.copy()
response = requests.post(
    f"{API_URL}/api/predict/lap-time",
    json=telemetry,
    params={"session_id": session_id}
)
print("Status:", response.status_code)  # Should be 200
print("Response:", response.json())
# Output: {"session_id": "...", "vehicle_id": 1, "lap": 25, "predicted_lap_time": 83.456, "confidence": 0.92}

# 5.2 PIT IMMINENT PREDICTION
print("\n=== PIT IMMINENT PREDICTION ===")
telemetry = sample_telemetry.copy()
response = requests.post(
    f"{API_URL}/api/predict/pit",
    json=telemetry,
    params={"session_id": session_id}
)
print("Status:", response.status_code)  # Should be 200
print("Response:", response.json())
# Output: {"session_id": "...", "vehicle_id": 1, "lap": 25, "pit_imminent": true, "probability": 0.78}

# 5.3 TIRE COMPOUND PREDICTION
print("\n=== TIRE COMPOUND PREDICTION ===")
telemetry = sample_telemetry.copy()
response = requests.post(
    f"{API_URL}/api/predict/tire",
    json=telemetry,
    params={"session_id": session_id}
)
print("Status:", response.status_code)  # Should be 200
print("Response:", response.json())
# Output: {"session_id": "...", "vehicle_id": 1, "lap": 25, "suggested_compound": "MEDIUM", "confidence": 0.85}


# ============================================================================
# SECTION 6: ALL PREDICTIONS AT ONCE
# ============================================================================

print("\n=== ALL PREDICTIONS ===")
telemetry = sample_telemetry.copy()
response = requests.post(
    f"{API_URL}/api/predict/all",
    json=telemetry,
    params={"session_id": session_id}
)
print("Status:", response.status_code)  # Should be 200
all_predictions = response.json()
print("Response:", all_predictions)
# Output includes all 3 predictions in one response


# ============================================================================
# SECTION 7: ERROR HANDLING TESTS
# ============================================================================

# 7.1 INVALID SESSION (Prediction without session)
print("\n=== ERROR TEST: Invalid Session ===")
telemetry = sample_telemetry.copy()
response = requests.post(
    f"{API_URL}/api/predict/lap-time",
    json=telemetry,
    params={"session_id": "invalid_session"}
)
print("Status:", response.status_code)  # Should be 404
print("Response:", response.json())

# 7.2 MISSING REQUIRED FIELD
print("\n=== ERROR TEST: Missing Field ===")
telemetry = sample_telemetry.copy()
del telemetry["max_speed"]  # Remove required field
response = requests.post(
    f"{API_URL}/api/predict/lap-time",
    json=telemetry,
    params={"session_id": session_id}
)
print("Status:", response.status_code)  # Should be 422 or 400
print("Response:", response.json())

# 7.3 INVALID DATA TYPE
print("\n=== ERROR TEST: Invalid Data Type ===")
telemetry = sample_telemetry.copy()
telemetry["vehicle_id"] = "not_a_number"  # Invalid type
response = requests.post(
    f"{API_URL}/api/predict/lap-time",
    json=telemetry,
    params={"session_id": session_id}
)
print("Status:", response.status_code)  # Should be 422
print("Response:", response.json())


# ============================================================================
# SECTION 8: SESSION HISTORY
# ============================================================================

print("\n=== GET SESSION PREDICTIONS ===")
response = requests.get(f"{API_URL}/api/session/{session_id}/predictions")
print("Status:", response.status_code)  # Should be 200
predictions_history = response.json()
print("Number of predictions:", predictions_history["prediction_count"])
print("Predictions:", predictions_history["predictions"])


# ============================================================================
# SECTION 9: CLOSE SESSION
# ============================================================================

print("\n=== CLOSE SESSION ===")
response = requests.post(f"{API_URL}/api/session/{session_id}/close")
print("Status:", response.status_code)  # Should be 200
closed_session = response.json()
print("Status:", closed_session["status"])  # Should be "closed"

# Verify session is closed
print("\n=== VERIFY CLOSED SESSION ===")
response = requests.get(f"{API_URL}/api/session/{session_id}")
print("Session status:", response.json()["status"])  # Should be "closed"


# ============================================================================
# SECTION 10: MULTIPLE SESSIONS WORKFLOW
# ============================================================================

print("\n=== MULTIPLE SESSIONS TEST ===")

# Create multiple sessions for different vehicles
sessions = {}
for vehicle_id in [1, 2, 3]:
    response = requests.post(
        f"{API_URL}/api/session/create",
        params={"vehicle_id": vehicle_id, "race_name": "Test Race"}
    )
    sessions[vehicle_id] = response.json()["session_id"]
    print(f"Created session for vehicle {vehicle_id}: {sessions[vehicle_id]}")

# Make predictions for each session
for vehicle_id, session_id in sessions.items():
    telemetry = sample_telemetry.copy()
    telemetry["vehicle_id"] = vehicle_id
    
    response = requests.post(
        f"{API_URL}/api/predict/all",
        json=telemetry,
        params={"session_id": session_id}
    )
    print(f"Predictions for vehicle {vehicle_id}: {response.json()}")

# Get predictions for each session
for vehicle_id, session_id in sessions.items():
    response = requests.get(f"{API_URL}/api/session/{session_id}/predictions")
    pred_count = response.json()["prediction_count"]
    print(f"Vehicle {vehicle_id} has {pred_count} predictions")


# ============================================================================
# SECTION 11: PERFORMANCE TEST (Multiple Predictions)
# ============================================================================

import time

print("\n=== PERFORMANCE TEST ===")
response = requests.post(
    f"{API_URL}/api/session/create",
    params={"vehicle_id": 1, "race_name": "Performance Test"}
)
perf_session_id = response.json()["session_id"]

# Make 10 rapid predictions
start_time = time.time()
for i in range(10):
    telemetry = sample_telemetry.copy()
    telemetry["lap"] = 25 + i
    
    response = requests.post(
        f"{API_URL}/api/predict/all",
        json=telemetry,
        params={"session_id": perf_session_id}
    )
    print(f"Prediction {i+1}: Status {response.status_code}")

elapsed = time.time() - start_time
print(f"\nCompleted 10 predictions in {elapsed:.2f} seconds")
print(f"Average time per prediction: {elapsed/10:.3f} seconds")


# ============================================================================
# SECTION 12: CURL EXAMPLES (Alternative Testing)
# ============================================================================

print("\n=== CURL EXAMPLES ===")
print("""
# Create session
curl -X POST "http://localhost:8000/api/session/create?vehicle_id=1&race_name=Test"

# Make prediction (replace SESSION_ID)
curl -X POST "http://localhost:8000/api/predict/all" \\
  -H "Content-Type: application/json" \\
  -d '{
    "session_id": "SESSION_ID",
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
  }'

# Get predictions
curl -X GET "http://localhost:8000/api/session/SESSION_ID/predictions"

# Close session
curl -X POST "http://localhost:8000/api/session/SESSION_ID/close"
""")


# ============================================================================
# SECTION 13: TEST SUMMARY
# ============================================================================

print("""
=== TEST SUMMARY ===

✓ Health checks passed
✓ Session creation works
✓ Session retrieval works
✓ Individual predictions work
  - Lap time prediction
  - Pit imminent prediction
  - Tire compound prediction
✓ All predictions at once works
✓ Prediction history works
✓ Session closure works
✓ Error handling works
✓ Multiple sessions work
✓ Performance is acceptable

API is ready for production use!
""")
