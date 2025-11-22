"""
Predictor models
"""
import logging

logger = logging.getLogger(__name__)


class PredictorModel:
    """Base class for predictor models"""
    
    def __init__(self, model_path: str):
        """
        Initialize predictor model.
        
        Args:
            model_path: Path to saved model file
        """
        self.model_path = model_path
        self.model = None
    
    def load(self):
        """Load model from disk"""
        raise NotImplementedError
    
    def predict(self, X):
        """Make prediction"""
        raise NotImplementedError


class LapTimePredictor(PredictorModel):
    """Lap time regression predictor"""
    
    def __init__(self, model_path: str):
        super().__init__(model_path)
        logger.info(f"Initialized LapTimePredictor with model at {model_path}")
    
    def load(self):
        """Load lap time model"""
        import pickle
        with open(self.model_path, 'rb') as f:
            self.model = pickle.load(f)
        logger.info("Loaded lap time model")
    
    def predict(self, X):
        """Predict lap time"""
        if self.model is None:
            self.load()
        return self.model.predict(X)


class PitImminentPredictor(PredictorModel):
    """Pit imminent binary classifier"""
    
    def __init__(self, model_path: str):
        super().__init__(model_path)
        logger.info(f"Initialized PitImminentPredictor with model at {model_path}")
    
    def load(self):
        """Load pit imminent model"""
        import pickle
        with open(self.model_path, 'rb') as f:
            self.model = pickle.load(f)
        logger.info("Loaded pit imminent model")
    
    def predict(self, X):
        """Predict pit imminent"""
        if self.model is None:
            self.load()
        return self.model.predict(X)
    
    def predict_proba(self, X):
        """Get prediction probabilities"""
        if self.model is None:
            self.load()
        return self.model.predict_proba(X)


class TireCompoundPredictor(PredictorModel):
    """Tire compound classifier"""
    
    def __init__(self, model_path: str):
        super().__init__(model_path)
        logger.info(f"Initialized TireCompoundPredictor with model at {model_path}")
    
    def load(self):
        """Load tire compound model"""
        import pickle
        with open(self.model_path, 'rb') as f:
            self.model = pickle.load(f)
        logger.info("Loaded tire compound model")
    
    def predict(self, X):
        """Predict tire compound"""
        if self.model is None:
            self.load()
        return self.model.predict(X)
    
    def predict_proba(self, X):
        """Get prediction probabilities"""
        if self.model is None:
            self.load()
        return self.model.predict_proba(X)
