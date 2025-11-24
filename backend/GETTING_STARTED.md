# Getting Started with Telemetry Prediction API

## Quick Start (5 minutes)

### Windows Users

1. **Double-click `quickstart.bat`**
   - This will automatically:
     - Create virtual environment
     - Install dependencies
     - Train models
     - Start the API server

2. **Open API documentation in browser**
   - Navigate to: `http://localhost:8000/docs`

### Mac/Linux Users

1. **Run quick start script**
   ```bash
   python quickstart.py
   ```

2. **Or manual setup**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Train models
   python train.py
   
   # Start server
   python -m uvicorn app.main:app --reload
   ```

3. **Open API documentation**
   - Navigate to: `http://localhost:8000/docs`

---

## Step-by-Step Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Prepare Your Data

Place your telemetry CSV files in `data/raw/Race1/`:
- `df_master_features_with_weather.csv` - Features with weather data
- `raw_telemetry.csv` (optional) - Raw telemetry
- `pivot.csv` (optional) - Telemetry pivot

Or generate sample data:
```bash
python prepare_data.py
```

### 3. Train Models

Train all three prediction models:

```bash
python train.py
```

This will:
- Load data from `data/processed/`
- Train lap time regression model
- Train pit imminent classifier
- Train tire compound classifier
- Save models to `data/models/`
- Generate scaler for feature normalization

Expected output:
```
Lap Time Model - R²: 0.8234
Pit Imminent Model - Accuracy: 0.8945
Tire Compound Model - Accuracy: 0.7823
```

### 4. Start the API Server

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

---

## Testing the API

### Option 1: Interactive API Documentation

Open in browser: `http://localhost:8000/docs`

Try out endpoints directly from the web interface.

### Option 2: Using Example Client

```bash
python example_client.py
```

This will demonstrate:
- Creating a session
- Making individual predictions
- Making all predictions at once
- Retrieving prediction history
- Closing a session

### Option 3: Using cURL

```bash
# Create session
curl -X POST "http://localhost:8000/api/session/create?vehicle_id=1&race_name=Test"

# Make prediction (replace SESSION_ID)
curl -X POST "http://localhost:8000/api/predict/all" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "SESSION_ID",
    "vehicle_id": 1,
    "lap": 25,
    "max_speed": 340.5,
    "avg_speed": 280.0,
    ...
  }'
```

### Option 4: Using Python Requests

```python
import requests

# Create session
response = requests.post(
    "http://localhost:8000/api/session/create",
    params={"vehicle_id": 1, "race_name": "Test"}
)
session_id = response.json()["session_id"]

# Make prediction
telemetry = {
    "session_id": session_id,
    "vehicle_id": 1,
    "lap": 25,
    "max_speed": 340.5,
    # ... other features
}

response = requests.post(
    "http://localhost:8000/api/predict/all",
    json=telemetry
)
predictions = response.json()
```

---

## API Endpoints Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/session/create` | Create new session |
| GET | `/api/session/{id}` | Get session info |
| POST | `/api/predict/lap-time` | Predict lap time |
| POST | `/api/predict/pit` | Predict pit imminent |
| POST | `/api/predict/tire` | Predict tire compound |
| POST | `/api/predict/all` | Make all predictions |
| GET | `/api/session/{id}/predictions` | Get session predictions |
| POST | `/api/session/{id}/close` | Close session |

---

## Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'fastapi'"

**Solution:** Install dependencies
```bash
pip install -r requirements.txt
```

### Problem: "FileNotFoundError: models not found"

**Solution:** Train the models first
```bash
python train.py
```

### Problem: "Port 8000 already in use"

**Solution:** Use a different port
```bash
python -m uvicorn app.main:app --port 8001
```

### Problem: API returns 404 for predictions

**Solution:** Create a session first
```bash
curl -X POST "http://localhost:8000/api/session/create?vehicle_id=1"
```

Then use the returned `session_id` in prediction requests.

### Problem: "No data found" when training

**Solution:** Prepare data first
```bash
python prepare_data.py
```

---

## Development

### Running Tests

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app
```

### Code Quality

```bash
# Format code
black app/

# Check style
flake8 app/

# Type checking
mypy app/
```

### Running with Docker

```bash
# Build image
docker build -t f1-telemetry .

# Run container
docker run -p 8000:8000 -v $(pwd)/data:/app/data f1-telemetry

# Or use docker-compose
docker-compose up
```

---

## API Request Example

### Create Session

**Request:**
```bash
POST /api/session/create?vehicle_id=1&race_name=Monaco%20Grand%20Prix
```

**Response (201 Created):**
```json
{
  "session_id": "race_abc123def456",
  "vehicle_id": 1,
  "race_name": "Monaco Grand Prix",
  "created_at": "2025-01-15T14:30:00",
  "status": "active"
}
```

### Make Prediction

**Request:**
```bash
POST /api/predict/all
Content-Type: application/json

{
  "session_id": "race_abc123def456",
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
```

**Response (200 OK):**
```json
{
  "session_id": "race_abc123def456",
  "vehicle_id": 1,
  "lap": 25,
  "lap_time": 83.456,
  "lap_time_confidence": 0.92,
  "pit_imminent": true,
  "pit_probability": 0.78,
  "tire_compound": "MEDIUM",
  "tire_confidence": 0.85
}
```

---

## Next Steps

1. **Customize Models**: Modify model hyperparameters in `train_model.py`
2. **Add Database**: Replace in-memory sessions with a database
3. **Add Authentication**: Implement JWT tokens for security
4. **Deploy**: Use Docker and cloud services for production
5. **Monitor**: Add logging, metrics, and alerting

---

## Support & Documentation

- **Full API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`
- **README**: See `README.md` for detailed documentation
- **Example Client**: See `example_client.py` for integration examples

---

Happy racing! 🏁
