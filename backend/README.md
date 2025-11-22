# F1 Telemetry Prediction API

A production-ready FastAPI backend for predicting F1 race telemetry metrics including lap times, pit stop timing, and tire compound suggestions.

## Features

- **Lap Time Prediction**: Regression model to predict lap completion times
- **Pit Imminent Detection**: Binary classifier to detect upcoming pit stops
- **Tire Compound Suggestion**: Multi-class classifier for optimal tire selection
- **Session Management**: Unique session IDs for tracking predictions
- **RESTful API**: FastAPI with comprehensive error handling and logging
- **Scalable ML Pipeline**: Scikit-learn models with preprocessing and scaling

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # API endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py           # Configuration and paths
│   ├── models/
│   │   ├── __init__.py
│   │   └── predictor.py        # Predictor model classes
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── prediction.py       # Prediction request/response schemas
│   │   ├── telemetry.py        # Telemetry input schema
│   │   └── session.py          # Session schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_loader.py      # Data loading utilities
│   │   ├── inference.py        # Inference engine
│   │   └── train_model.py      # Model training pipeline
│   └── utils/
│       ├── __init__.py
│       └── preprocess.py       # Preprocessing utilities
├── data/
│   ├── raw/
│   │   └── Race1/
│   │       ├── raw_telemetry.csv
│   │       ├── df_master_features_with_weather.csv
│   │       └── pivot.csv
│   ├── processed/
│   │   ├── telemetry_pivot.csv
│   │   └── df_master_features_with_weather.csv
│   └── models/
│       ├── lap_time_model.pkl
│       ├── pit_imminent_model.pkl
│       ├── tire_compound_model.pkl
│       ├── scaler.pkl
│       └── feature_names.pkl
├── requirements.txt
└── README.md
```

## Installation

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## Usage

### Training Models

Train all models on your telemetry data:

```bash
python -m app.services.train_model
```

This will:
1. Load processed data from `data/processed/`
2. Train three models (lap time, pit imminent, tire compound)
3. Save models to `data/models/`
4. Create scaler and feature mappings

### Running the API Server

Start the FastAPI server:

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Using python
python app/main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Session Management

#### Create Session
```
POST /api/session/create?vehicle_id=1&race_name=Race%201
```

Response:
```json
{
  "session_id": "race_abc123def456",
  "vehicle_id": 1,
  "race_name": "Race 1",
  "created_at": "2025-01-15T14:30:00",
  "status": "active"
}
```

#### Get Session Info
```
GET /api/session/{session_id}
```

#### Close Session
```
POST /api/session/{session_id}/close
```

#### Get Session Predictions
```
GET /api/session/{session_id}/predictions
```

### Predictions

#### Predict Lap Time
```
POST /api/predict/lap-time
Content-Type: application/json

{
  "session_id": "race_abc123def456",
  "vehicle_id": 1,
  "lap": 25,
  "max_speed": 340.5,
  "avg_speed": 280.0,
  "std_speed": 45.2,
  ...
}
```

Response:
```json
{
  "session_id": "race_abc123def456",
  "vehicle_id": 1,
  "lap": 25,
  "predicted_lap_time": 83.456,
  "confidence": 0.92
}
```

#### Predict Pit Imminent
```
POST /api/predict/pit
```

Response:
```json
{
  "session_id": "race_abc123def456",
  "vehicle_id": 1,
  "lap": 25,
  "pit_imminent": true,
  "probability": 0.78
}
```

#### Predict Tire Compound
```
POST /api/predict/tire
```

Response:
```json
{
  "session_id": "race_abc123def456",
  "vehicle_id": 1,
  "lap": 25,
  "suggested_compound": "MEDIUM",
  "confidence": 0.85
}
```

#### Predict All
```
POST /api/predict/all
```

Response:
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

## Data Format

### Required Input Features (23 features)

The API expects these 23 numeric features for predictions:

1. `vehicle_id` - Vehicle identifier
2. `lap` - Lap number
3. `max_speed` - Maximum speed in lap (km/h)
4. `avg_speed` - Average speed (km/h)
5. `std_speed` - Speed standard deviation
6. `avg_throttle` - Average throttle position (0-1)
7. `brake_front_freq` - Front brake frequency
8. `brake_rear_freq` - Rear brake frequency
9. `dominant_gear` - Most used gear
10. `avg_steer_angle` - Average steering angle
11. `avg_long_accel` - Average longitudinal acceleration
12. `avg_lat_accel` - Average lateral acceleration
13. `avg_rpm` - Average engine RPM
14. `rolling_std_lap_time` - Rolling std dev of lap time
15. `lap_time_delta` - Difference from optimal lap
16. `tire_wear_high` - Maximum tire wear level (0-1)
17. `air_temp` - Air temperature (°C)
18. `track_temp` - Track temperature (°C)
19. `humidity` - Humidity percentage (0-100)
20. `pressure` - Air pressure (hPa)
21. `wind_speed` - Wind speed (km/h)
22. `wind_direction` - Wind direction (degrees)
23. `rain` - Rain level (0-1)

## Model Architecture

### Lap Time Prediction (Regression)
- **Algorithm**: Random Forest Regressor
- **Trees**: 100
- **Max Depth**: 15
- **Output**: Predicted lap time in seconds

### Pit Imminent (Binary Classification)
- **Algorithm**: Random Forest Classifier
- **Trees**: 100
- **Max Depth**: 12
- **Classes**: {0: Not Imminent, 1: Imminent}
- **Output**: Boolean + probability

### Tire Compound (Multi-class Classification)
- **Algorithm**: Random Forest Classifier
- **Trees**: 100
- **Max Depth**: 12
- **Classes**: {SOFT, MEDIUM, HARD}
- **Output**: Compound name + confidence

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful prediction
- `201 CREATED` - Session created
- `400 BAD REQUEST` - Invalid input data
- `404 NOT FOUND` - Session or resource not found
- `500 INTERNAL SERVER ERROR` - Server error

Example error response:
```json
{
  "detail": "Missing required fields: max_speed, avg_speed"
}
```

## Logging

Logs are output to console with format:
```
%(asctime)s - %(name)s - %(levelname)s - %(message)s
```

Configure logging level via `LOGGING_LEVEL` environment variable:
```bash
export LOGGING_LEVEL=DEBUG
```

## Clean Architecture Principles

- **Separation of Concerns**: Routes handle HTTP, services handle ML logic, utils handle data prep
- **No Business Logic in Routes**: Routes are thin, all ML logic in services
- **Reusable Components**: Preprocessing, scaling, and inference are modular
- **Dependency Injection**: Models loaded once and reused across requests
- **Error Handling**: Comprehensive try-catch with logging at all levels

## Performance Considerations

- Models are loaded once on initialization
- Scaler is cached in memory for fast preprocessing
- Feature scaling is efficient with cached StandardScaler
- Random Forest models are parallelized (n_jobs=-1)

## Production Deployment

For production deployment:

1. Use a production ASGI server (e.g., Gunicorn with Uvicorn workers)
2. Add database for session persistence
3. Add authentication/authorization
4. Use environment variables for configuration
5. Add model versioning system
6. Implement request rate limiting
7. Add comprehensive monitoring and alerting
8. Use Docker for containerization

Example production command:
```bash
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Testing

Example curl requests:

```bash
# Create session
curl -X POST "http://localhost:8000/api/session/create?vehicle_id=1&race_name=Race%201"

# Make prediction
curl -X POST "http://localhost:8000/api/predict/lap-time" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "race_abc123def456",
    "vehicle_id": 1,
    "lap": 25,
    "max_speed": 340.5,
    ...
  }'
```

## Troubleshooting

### Models not found
Ensure you've run the training script and models are in `data/models/`

### Import errors
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Port already in use
Use a different port:
```bash
uvicorn app.main:app --port 8001
```

## License

Proprietary - F1 Telemetry Prediction System
