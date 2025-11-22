"""
Data preparation script for F1 Telemetry
Prepares raw data into the format expected by the ML pipeline
"""
import pandas as pd
import numpy as np
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def prepare_data_from_raw(
    raw_features_path: Path,
    output_dir: Path,
    target_columns: list = None
) -> pd.DataFrame:
    """
    Prepare data from raw CSV files.
    
    Args:
        raw_features_path: Path to raw features CSV
        output_dir: Output directory for processed data
        target_columns: Columns to include in output
    
    Returns:
        Prepared dataframe
    """
    logger.info(f"Loading raw data from {raw_features_path}")
    
    # Load raw data
    df = pd.read_csv(raw_features_path)
    logger.info(f"Loaded data: {df.shape}")
    
    # Expected feature columns
    expected_features = [
        'vehicle_id', 'lap', 'max_speed', 'avg_speed', 'std_speed', 'avg_throttle',
        'brake_front_freq', 'brake_rear_freq', 'dominant_gear', 'avg_steer_angle',
        'avg_long_accel', 'avg_lat_accel', 'avg_rpm',
        'rolling_std_lap_time', 'lap_time_delta', 'tire_wear_high',
        'air_temp', 'track_temp', 'humidity', 'pressure', 'wind_speed',
        'wind_direction', 'rain', 'lap_time', 'pit_imminent', 'tire_compound'
    ]
    
    # Check which columns are available
    available_cols = [col for col in expected_features if col in df.columns]
    logger.info(f"Available columns: {len(available_cols)}/{len(expected_features)}")
    
    # Select available columns
    df_processed = df[available_cols].copy()
    
    # Handle missing values
    numeric_cols = df_processed.select_dtypes(include=[np.number]).columns
    df_processed[numeric_cols] = df_processed[numeric_cols].fillna(df_processed[numeric_cols].mean())
    
    logger.info(f"Processed data shape: {df_processed.shape}")
    
    # Save processed data
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "df_master_features_with_weather.csv"
    df_processed.to_csv(output_path, index=False)
    logger.info(f"Saved processed data to {output_path}")
    
    return df_processed


def validate_dataset(df: pd.DataFrame) -> bool:
    """
    Validate that dataset has all required columns and reasonable values.
    
    Args:
        df: Dataframe to validate
    
    Returns:
        True if valid, False otherwise
    """
    logger.info("Validating dataset...")
    
    required_cols = [
        'vehicle_id', 'lap', 'max_speed', 'avg_speed', 'std_speed', 'avg_throttle',
        'brake_front_freq', 'brake_rear_freq', 'dominant_gear', 'avg_steer_angle',
        'avg_long_accel', 'avg_lat_accel', 'avg_rpm',
        'rolling_std_lap_time', 'lap_time_delta', 'tire_wear_high',
        'air_temp', 'track_temp', 'humidity', 'pressure', 'wind_speed',
        'wind_direction', 'rain'
    ]
    
    # Check columns
    missing_cols = set(required_cols) - set(df.columns)
    if missing_cols:
        logger.error(f"Missing columns: {missing_cols}")
        return False
    
    # Check for null values in critical columns
    critical_cols = required_cols[:13]  # At least features
    null_counts = df[critical_cols].isnull().sum()
    if null_counts.any():
        logger.warning(f"Null values found:\n{null_counts[null_counts > 0]}")
    
    # Check value ranges
    if 'lap_time' in df.columns:
        if (df['lap_time'] < 60) or (df['lap_time'] > 150):
            logger.warning(f"Lap times outside expected range: min={df['lap_time'].min()}, max={df['lap_time'].max()}")
    
    logger.info("Validation complete")
    return True


def create_sample_data(output_dir: Path) -> pd.DataFrame:
    """
    Create sample data for testing when real data is unavailable.
    
    Args:
        output_dir: Output directory
    
    Returns:
        Sample dataframe
    """
    logger.info("Creating sample data...")
    
    np.random.seed(42)
    n_samples = 500
    
    data = {
        'vehicle_id': np.random.randint(1, 21, n_samples),
        'lap': np.random.randint(1, 58, n_samples),
        'max_speed': np.random.normal(330, 20, n_samples),
        'avg_speed': np.random.normal(270, 25, n_samples),
        'std_speed': np.random.normal(45, 8, n_samples),
        'avg_throttle': np.random.uniform(0.3, 1.0, n_samples),
        'brake_front_freq': np.random.randint(8, 20, n_samples),
        'brake_rear_freq': np.random.randint(5, 15, n_samples),
        'dominant_gear': np.random.randint(3, 8, n_samples),
        'avg_steer_angle': np.random.normal(5, 3, n_samples),
        'avg_long_accel': np.random.normal(2.5, 1, n_samples),
        'avg_lat_accel': np.random.normal(3.0, 1, n_samples),
        'avg_rpm': np.random.normal(11000, 1500, n_samples),
        'rolling_std_lap_time': np.random.uniform(0.1, 1.5, n_samples),
        'lap_time_delta': np.random.normal(0.5, 0.8, n_samples),
        'tire_wear_high': np.random.uniform(0.1, 0.9, n_samples),
        'air_temp': np.random.normal(25, 5, n_samples),
        'track_temp': np.random.normal(45, 10, n_samples),
        'humidity': np.random.uniform(40, 85, n_samples),
        'pressure': np.random.normal(1013, 5, n_samples),
        'wind_speed': np.random.uniform(0, 15, n_samples),
        'wind_direction': np.random.uniform(0, 360, n_samples),
        'rain': np.random.uniform(0, 0.3, n_samples),
        'lap_time': np.random.normal(82, 3, n_samples),
        'pit_imminent': np.random.binomial(1, 0.3, n_samples),
        'tire_compound': np.random.choice(['SOFT', 'MEDIUM', 'HARD'], n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Save sample data
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "df_master_features_with_weather.csv"
    df.to_csv(output_path, index=False)
    logger.info(f"Saved sample data to {output_path}")
    
    return df


if __name__ == "__main__":
    # Get paths
    backend_path = Path(__file__).parent
    data_dir = backend_path / "data"
    raw_dir = data_dir / "raw" / "Race1"
    processed_dir = data_dir / "processed"
    
    # Try to load and prepare raw data
    raw_features_path = raw_dir / "df_master_features_with_weather.csv"
    
    if raw_features_path.exists():
        logger.info("Found raw data, preparing...")
        df = prepare_data_from_raw(raw_features_path, processed_dir)
        validate_dataset(df)
    else:
        logger.info("Raw data not found, creating sample data...")
        df = create_sample_data(processed_dir)
        validate_dataset(df)
    
    logger.info("Data preparation complete!")
    logger.info(f"Processed data saved to {processed_dir}")
