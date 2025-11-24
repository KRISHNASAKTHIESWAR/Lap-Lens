"""
ExplainAI - Gemini-based model explanation engine
Generates natural language explanations for model predictions using Google Generative AI
"""
import logging
import os
from typing import Dict
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class ExplainAI:
    """Gemini-based explanation engine for model predictions"""
    
    def __init__(self):
        """Initialize ExplainAI with Gemini API key from environment"""
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")
        self.model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name)
                logger.info(f"ExplainAI initialized with Gemini model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to configure Gemini API: {e}")
                self.model = None
        else:
            logger.warning("GEMINI_API_KEY not set in environment. ExplainAI will not be available.")
    
    def is_available(self) -> bool:
        """Check if ExplainAI is properly configured"""
        return self.model is not None
    
    def explain_prediction(
        self,
        features: Dict[str, float],
        prediction: float | int | str,
        task: str = "prediction"
    ) -> str:
        """
        Generate natural language explanation for a model prediction
        
        Args:
            features: Dictionary of input features
            prediction: Model prediction value
            task: Type of prediction (lap_time, pit_detection, tire_suggestion)
            
        Returns:
            Natural language explanation string
        """
        if not self.is_available():
            logger.warning("ExplainAI not available. Returning default message.")
            return "Explanation unavailable: Gemini API key not configured."
        
        try:
            # Build feature string
            feature_lines = [
                f"- {k}: {v:.2f}" if isinstance(v, float) else f"- {k}: {v}"
                for k, v in features.items()
            ]
            features_text = "\n".join(feature_lines)

            # Build prompt
            prompt = self._build_prompt(features_text, prediction, task)

            # Call Gemini using the new API
            response = self.model.generate_content(prompt)

            if response and response.text:
                return response.text.strip()

            logger.warning("Empty response from Gemini.")
            return "Unable to generate explanation at this time."
        
        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            return f"Explanation generation failed: {str(e)}"
    
    def _build_prompt(self, features_text: str, prediction: float | int | str, task: str) -> str:
        """Build task-specific prompt for Gemini"""

        if task == "lap_time":
            return f"""You are an expert Formula 1 race engineer.

Telemetry Input:
{features_text}

Predicted Lap Time: {prediction:.3f} seconds

Explain *why* the model predicted this value.
Focus on the top logical factors.
Keep it short (2–3 sentences)."""

        elif task == "pit_detection":
            return f"""You are a Formula 1 pit strategy analyst.

Telemetry Input:
{features_text}

Pit Prediction: {prediction}

Explain the most important factors that contributed to this prediction.
Keep it short (2–3 sentences)."""

        elif task == "tire_suggestion":
            return f"""You are a Formula 1 tire strategy expert.

Telemetry Input:
{features_text}

Suggested Tire: {prediction}

Explain why this tire compound is recommended based on the data.
Keep it short (2–3 sentences)."""

        # Default
        return f"""Features:
{features_text}

Prediction: {prediction}

Explain the main factors influencing this output."""


