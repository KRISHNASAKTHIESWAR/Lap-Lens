import os
from pathlib import Path

# ------------------------------
# Project root
# ------------------------------
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent  # Lap-Lens root

# ------------------------------
# Data directories (unchanged)
# ------------------------------
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw" / "Race1"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

# ------------------------------
# Models directory (explicit)
# ------------------------------
MODELS_DIR = Path(__file__).resolve().parent.parent / "data" / "models"

print("MODELS_DIR set to:", MODELS_DIR)
# Model file paths
LAP_TIME_MODEL_PATH = MODELS_DIR / "lap_time_model.pkl"
PIT_IMMINENT_MODEL_PATH = MODELS_DIR / "pit_imminent_model.pkl"
TIRE_COMPOUND_MODEL_PATH = MODELS_DIR / "tire_compound_model.pkl"

SCALER_PATH = MODELS_DIR / "scaler.pkl"
FEATURE_NAMES_PATH = MODELS_DIR / "feature_names.pkl"

# ------------------------------
# Ensure processed data folder exists only
# ------------------------------
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

# ------------------------------
# Optional: check models exist (fail early)
# ------------------------------
for path in [LAP_TIME_MODEL_PATH, PIT_IMMINENT_MODEL_PATH, TIRE_COMPOUND_MODEL_PATH, SCALER_PATH]:
    if not path.exists():
        print(f"WARNING: Model file not found: {path}")

# ------------------------------
# API Configuration
# ------------------------------
API_TITLE = "F1 Telemetry Prediction API"
API_VERSION = "1.0.0"
API_DESCRIPTION = "Predicts lap time, pit imminent, and tire compound for F1 races"

# ------------------------------
# Feature columns
# ------------------------------
FEATURE_COLUMNS = [
    'vehicle_id', 'lap', 'max_speed', 'avg_speed', 'std_speed', 'avg_throttle',
    'brake_front_freq', 'brake_rear_freq', 'dominant_gear', 'avg_steer_angle',
    'avg_long_accel', 'avg_lat_accel', 'avg_rpm',
    'rolling_std_lap_time', 'lap_time_delta', 'tire_wear_high',
    'air_temp', 'track_temp', 'humidity', 'pressure', 'wind_speed',
    'wind_direction', 'rain'
]

TARGET_LAP_TIME = 'lap_time'
TARGET_PIT_IMMINENT = 'pit_imminent'
TARGET_TIRE_COMPOUND = 'tire_compound'

NUMERIC_FEATURES = FEATURE_COLUMNS.copy()

# ------------------------------
# Logging
# ------------------------------
LOGGING_LEVEL = os.getenv("LOGGING_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# ------------------------------
# Gemini API
# ------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
