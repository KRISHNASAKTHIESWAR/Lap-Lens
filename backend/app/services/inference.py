"""
Inference service for making predictions
"""
import logging
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, Dict, Any, Optional

from app.utils.preprocess import scale_features, preprocess_input_dict
from app.core.config import (
    LAP_TIME_MODEL_PATH, PIT_IMMINENT_MODEL_PATH, TIRE_COMPOUND_MODEL_PATH,
    SCALER_PATH, FEATURE_NAMES_PATH, NUMERIC_FEATURES
)

logger = logging.getLogger(__name__)


class InferenceEngine:
    """Handles model inference and predictions"""
    
    def __init__(self):
        """Initialize InferenceEngine and load models"""
        self.lap_time_model = None
        self.pit_imminent_model = None
        self.tire_compound_model = None
        self.scaler = None
        self.feature_columns = None
        self.models_loaded = False
        
        self._load_models()
    
    def _load_models(self) -> None:
        """Load all trained models and scaler from disk"""
        try:
            if LAP_TIME_MODEL_PATH.exists():
                with open(LAP_TIME_MODEL_PATH, 'rb') as f:
                    self.lap_time_model = pickle.load(f)
                logger.info("Loaded lap time model")
            else:
                logger.warning(f"Lap time model not found: {LAP_TIME_MODEL_PATH}")
            
            if PIT_IMMINENT_MODEL_PATH.exists():
                with open(PIT_IMMINENT_MODEL_PATH, 'rb') as f:
                    self.pit_imminent_model = pickle.load(f)
                logger.info("Loaded pit imminent model")
            else:
                logger.warning(f"Pit imminent model not found: {PIT_IMMINENT_MODEL_PATH}")
            
            if TIRE_COMPOUND_MODEL_PATH.exists():
                with open(TIRE_COMPOUND_MODEL_PATH, 'rb') as f:
                    self.tire_compound_model = pickle.load(f)
                logger.info("Loaded tire compound model")
            else:
                logger.warning(f"Tire compound model not found: {TIRE_COMPOUND_MODEL_PATH}")
            
            if SCALER_PATH.exists():
                with open(SCALER_PATH, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info("Loaded scaler")
            else:
                logger.warning(f"Scaler not found: {SCALER_PATH}")
            
            if FEATURE_NAMES_PATH.exists():
                with open(FEATURE_NAMES_PATH, 'rb') as f:
                    self.feature_columns = pickle.load(f)
                logger.info("Loaded feature names")
            else:
                self.feature_columns = NUMERIC_FEATURES
            
            self.models_loaded = (
                self.lap_time_model is not None and
                self.pit_imminent_model is not None and
                self.tire_compound_model is not None and
                self.scaler is not None
            )
            
            if self.models_loaded:
                logger.info("All models loaded successfully")
            else:
                logger.warning("Some models failed to load")
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise
    
    def ensure_models_loaded(self) -> bool:
        """Check if all models are loaded"""
        if not self.models_loaded:
            logger.warning("Models not loaded, attempting to reload...")
            self._load_models()
        return self.models_loaded
    
    def preprocess_prediction_input(self, input_data: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Preprocess input data for prediction.
        
        Args:
            input_data: Input data dictionary
        
        Returns:
            Tuple of (preprocessed features, metadata)
        """
        try:
            X, metadata = preprocess_input_dict(input_data, self.feature_columns or NUMERIC_FEATURES)
            
            # Scale features
            if self.scaler:
                X_scaled = self.scaler.transform(X)
            else:
                logger.warning("Scaler not available, using unscaled features")
                X_scaled = X
            
            return X_scaled, metadata
            
        except Exception as e:
            logger.error(f"Error preprocessing input: {e}")
            raise
    
    def predict_lap_time(self, X: np.ndarray) -> Tuple[float, float]:
        """
        Predict lap time.
        
        Args:
            X: Preprocessed features
        
        Returns:
            Tuple of (predicted lap time, confidence)
        """
        if self.lap_time_model is None:
            raise RuntimeError("Lap time model not loaded")
        
        try:
            prediction = self.lap_time_model.predict(X)[0]
            
            # Estimate confidence from feature importance and variance
            confidence = self._estimate_confidence(self.lap_time_model, X)
            
            logger.info(f"Lap time prediction: {prediction:.2f}s, confidence: {confidence:.2f}")
            return float(prediction), float(confidence)
            
        except Exception as e:
            logger.error(f"Error predicting lap time: {e}")
            raise
    
    def predict_pit_imminent(self, X: np.ndarray) -> Tuple[bool, float]:
        """
        Predict if pit stop is imminent.
        
        Args:
            X: Preprocessed features
        
        Returns:
            Tuple of (pit imminent boolean, probability)
        """
        if self.pit_imminent_model is None:
            raise RuntimeError("Pit imminent model not loaded")
        
        try:
            prediction = self.pit_imminent_model.predict(X)[0]
            probabilities = self.pit_imminent_model.predict_proba(X)[0]
            probability = float(max(probabilities))
            
            logger.info(f"Pit imminent prediction: {bool(prediction)}, probability: {probability:.2f}")
            return bool(prediction), probability
            
        except Exception as e:
            logger.error(f"Error predicting pit imminent: {e}")
            raise
    
    def predict_tire_compound(self, X: np.ndarray) -> Tuple[str, float]:
        """
        Predict suggested tire compound.
        
        Args:
            X: Preprocessed features
        
        Returns:
            Tuple of (tire compound, confidence)
        """
        if self.tire_compound_model is None:
            raise RuntimeError("Tire compound model not loaded")
        
        try:
            prediction = self.tire_compound_model.predict(X)[0]
            probabilities = self.tire_compound_model.predict_proba(X)[0]
            confidence = float(max(probabilities))
            
            logger.info(f"Tire compound prediction: {prediction}, confidence: {confidence:.2f}")
            return str(prediction), confidence
            
        except Exception as e:
            logger.error(f"Error predicting tire compound: {e}")
            raise
    
    def predict_all(self, X: np.ndarray) -> Dict[str, Any]:
        """
        Make all predictions for given input.
        
        Args:
            X: Preprocessed features
        
        Returns:
            Dictionary with all predictions
        """
        if not self.ensure_models_loaded():
            raise RuntimeError("Models not loaded")
        
        results = {}
        
        try:
            lap_time, lap_confidence = self.predict_lap_time(X)
            results['lap_time'] = lap_time
            results['lap_time_confidence'] = lap_confidence
            
            pit_imminent, pit_probability = self.predict_pit_imminent(X)
            results['pit_imminent'] = pit_imminent
            results['pit_probability'] = pit_probability
            
            tire_compound, tire_confidence = self.predict_tire_compound(X)
            results['tire_compound'] = tire_compound
            results['tire_confidence'] = tire_confidence
            
            logger.info(f"All predictions completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"Error making predictions: {e}")
            raise
    
    def _estimate_confidence(self, model, X: np.ndarray) -> float:
        """
        Estimate model confidence based on various factors.
        
        Args:
            model: Trained model
            X: Input features
        
        Returns:
            Confidence score between 0 and 1
        """
        try:
            # Use feature importance as basis
            if hasattr(model, 'feature_importances_'):
                max_importance = np.max(model.feature_importances_)
                # Normalize to 0-1 range, with min confidence of 0.5
                confidence = 0.5 + (0.5 * max_importance)
            else:
                # Default confidence if feature importance not available
                confidence = 0.75
            
            return min(float(confidence), 1.0)
            
        except Exception as e:
            logger.warning(f"Could not estimate confidence: {e}, using default")
            return 0.75
