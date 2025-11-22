"""
Model training service
"""
import logging
import pickle
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score, precision_score, recall_score, mean_squared_error
from typing import Tuple, Dict, Any

from app.services.data_loader import DataLoader
from app.utils.preprocess import (
    handle_missing_values, scale_features, remove_outliers, select_features
)
from app.core.config import (
    FEATURE_COLUMNS, TARGET_LAP_TIME, TARGET_PIT_IMMINENT, TARGET_TIRE_COMPOUND,
    LAP_TIME_MODEL_PATH, PIT_IMMINENT_MODEL_PATH, TIRE_COMPOUND_MODEL_PATH,
    SCALER_PATH, FEATURE_NAMES_PATH, NUMERIC_FEATURES, PROCESSED_DATA_DIR
)

logger = logging.getLogger(__name__)


class ModelTrainer:
    """Handles training of all prediction models"""
    
    def __init__(self, data_dir: Path = PROCESSED_DATA_DIR.parent):
        """
        Initialize ModelTrainer.
        
        Args:
            data_dir: Path to data directory
        """
        self.data_loader = DataLoader(data_dir)
        self.scaler = None
        self.lap_time_model = None
        self.pit_imminent_model = None
        self.tire_compound_model = None
        self.feature_columns = NUMERIC_FEATURES
    
    def load_training_data(self) -> pd.DataFrame:
        """
        Load and prepare training data.
        
        Returns:
            Prepared DataFrame ready for training
        """
        logger.info("Loading training data...")
        
        try:
            df = self.data_loader.load_combined_data()
        except FileNotFoundError:
            logger.warning("Could not load combined data, creating synthetic data for demonstration")
            df = self._create_synthetic_data()
        
        # Clean data
        logger.info("Cleaning data...")
        df = handle_missing_values(df, strategy='mean')
        
        # Remove outliers (optional, can affect small datasets)
        if len(df) > 100:
            df = remove_outliers(df, z_threshold=3.0)
        
        logger.info(f"Training data shape: {df.shape}")
        return df
    
    def _create_synthetic_data(self) -> pd.DataFrame:
        """
        Create synthetic training data for demonstration when real data is unavailable.
        
        Returns:
            Synthetic DataFrame
        """
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
        logger.info(f"Created synthetic data: {df.shape}")
        return df
    
    def prepare_training_sets(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Prepare features and targets for training.
        
        Args:
            df: Input dataframe
        
        Returns:
            Tuple of (X_scaled, y_lap_time, y_pit, y_tire)
        """
        logger.info("Preparing training sets...")
        
        # Select features
        X = select_features(df, self.feature_columns)
        
        # Ensure all required features are present
        missing_features = set(self.feature_columns) - set(X.columns)
        if missing_features:
            logger.warning(f"Missing features: {missing_features}, will be initialized with zeros")
            for feature in missing_features:
                X[feature] = 0
        
        # Reorder columns
        X = X[self.feature_columns]
        
        # Scale features
        X_scaled, self.scaler = scale_features(X, fit=True)
        
        # Prepare targets
        y_lap_time = df[TARGET_LAP_TIME].values if TARGET_LAP_TIME in df.columns else np.random.normal(82, 3, len(df))
        y_pit = df[TARGET_PIT_IMMINENT].values if TARGET_PIT_IMMINENT in df.columns else np.random.binomial(1, 0.3, len(df))
        y_tire = df[TARGET_TIRE_COMPOUND].values if TARGET_TIRE_COMPOUND in df.columns else np.random.choice(['SOFT', 'MEDIUM', 'HARD'], len(df))
        
        logger.info(f"Training sets prepared: X={X_scaled.shape}, targets ready")
        return X_scaled, y_lap_time, y_pit, y_tire
    
    def train_lap_time_model(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """
        Train lap time regression model.
        
        Args:
            X: Training features
            y: Lap time targets
        
        Returns:
            Dictionary with model metrics
        """
        logger.info("Training lap time regression model...")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.lap_time_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.lap_time_model.fit(X_train, y_train)
        
        y_pred = self.lap_time_model.predict(X_test)
        r2 = r2_score(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        logger.info(f"Lap time model - R²: {r2:.4f}, RMSE: {rmse:.4f}")
        
        return {'r2': float(r2), 'rmse': float(rmse)}
    
    def train_pit_imminent_model(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """
        Train pit imminent classifier.
        
        Args:
            X: Training features
            y: Pit imminent targets (binary)
        
        Returns:
            Dictionary with model metrics
        """
        logger.info("Training pit imminent classifier...")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.pit_imminent_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.pit_imminent_model.fit(X_train, y_train)
        
        y_pred = self.pit_imminent_model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        
        logger.info(f"Pit model - Accuracy: {accuracy:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}")
        
        return {'accuracy': float(accuracy), 'precision': float(precision), 'recall': float(recall)}
    
    def train_tire_compound_model(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """
        Train tire compound classifier.
        
        Args:
            X: Training features
            y: Tire compound targets (categorical)
        
        Returns:
            Dictionary with model metrics
        """
        logger.info("Training tire compound classifier...")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.tire_compound_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.tire_compound_model.fit(X_train, y_train)
        
        y_pred = self.tire_compound_model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0, average='weighted')
        
        logger.info(f"Tire model - Accuracy: {accuracy:.4f}, Weighted Precision: {precision:.4f}")
        
        return {'accuracy': float(accuracy), 'precision': float(precision)}
    
    def save_models(self) -> None:
        """Save all trained models and scaler to disk."""
        logger.info("Saving models...")
        
        if self.lap_time_model is None or self.pit_imminent_model is None or self.tire_compound_model is None:
            raise ValueError("Models must be trained before saving")
        
        LAP_TIME_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        
        with open(LAP_TIME_MODEL_PATH, 'wb') as f:
            pickle.dump(self.lap_time_model, f)
        logger.info(f"Saved lap time model to {LAP_TIME_MODEL_PATH}")
        
        with open(PIT_IMMINENT_MODEL_PATH, 'wb') as f:
            pickle.dump(self.pit_imminent_model, f)
        logger.info(f"Saved pit imminent model to {PIT_IMMINENT_MODEL_PATH}")
        
        with open(TIRE_COMPOUND_MODEL_PATH, 'wb') as f:
            pickle.dump(self.tire_compound_model, f)
        logger.info(f"Saved tire compound model to {TIRE_COMPOUND_MODEL_PATH}")
        
        with open(SCALER_PATH, 'wb') as f:
            pickle.dump(self.scaler, f)
        logger.info(f"Saved scaler to {SCALER_PATH}")
        
        with open(FEATURE_NAMES_PATH, 'wb') as f:
            pickle.dump(self.feature_columns, f)
        logger.info(f"Saved feature names to {FEATURE_NAMES_PATH}")
    
    def train_all_models(self) -> Dict[str, Dict[str, float]]:
        """
        Train all models in sequence.
        
        Returns:
            Dictionary with metrics for all models
        """
        logger.info("Starting model training pipeline...")
        
        # Load and prepare data
        df = self.load_training_data()
        X, y_lap_time, y_pit, y_tire = self.prepare_training_sets(df)
        
        # Train models
        metrics = {}
        metrics['lap_time'] = self.train_lap_time_model(X, y_lap_time)
        metrics['pit_imminent'] = self.train_pit_imminent_model(X, y_pit)
        metrics['tire_compound'] = self.train_tire_compound_model(X, y_tire)
        
        # Save models
        self.save_models()
        
        logger.info("Model training pipeline completed successfully")
        return metrics


def train_models_cli():
    """CLI entry point for training models"""
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    trainer = ModelTrainer()
    metrics = trainer.train_all_models()
    
    print("\n" + "="*50)
    print("MODEL TRAINING COMPLETED")
    print("="*50)
    print(f"Lap Time Model - R²: {metrics['lap_time']['r2']:.4f}")
    print(f"Pit Imminent Model - Accuracy: {metrics['pit_imminent']['accuracy']:.4f}")
    print(f"Tire Compound Model - Accuracy: {metrics['tire_compound']['accuracy']:.4f}")
    print("="*50 + "\n")


if __name__ == "__main__":
    train_models_cli()
