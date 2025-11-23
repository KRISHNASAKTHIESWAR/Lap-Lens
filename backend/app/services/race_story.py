"""
RaceStoryGenerator - Gemini-based race narrative engine
Generates natural language race stories for completed sessions using Google Generative AI
"""
import logging
import os
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class RaceStoryGenerator:
    """Gemini-based race story engine for post-race narratives"""
    
    def __init__(self):
        """Initialize RaceStoryGenerator with Gemini API key from environment"""
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
        self.model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name)
                logger.info(f"RaceStoryGenerator initialized with Gemini model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to configure Gemini API: {e}")
                self.model = None
        else:
            logger.warning("GEMINI_API_KEY not set in environment. RaceStoryGenerator will not be available.")
    
    def is_available(self) -> bool:
        """Check if RaceStoryGenerator is properly configured"""
        return self.model is not None
    
    def generate_story(
        self,
        session_id: str,
        vehicle_id: int,
        race_events: List[Dict[str, Any]],
        summary_stats: Dict[str, Any]
    ) -> str:
        """
        Generate a natural language race story for a completed session
        
        Args:
            session_id: Unique session identifier
            vehicle_id: Vehicle identifier
            race_events: List of dicts with lap events, e.g. [{"lap": 1, "event": "..."}]
            summary_stats: Dict with race statistics (total_laps, best_lap, avg_lap_time, etc.)
            
        Returns:
            Natural language race story string
        """
        if not self.is_available():
            logger.warning("RaceStoryGenerator not available. Returning default message.")
            return "Story unavailable: Gemini API key not configured."
        
        try:
            # Format race events
            race_events_text = self._format_race_events(race_events)
            
            # Format summary statistics
            summary_stats_text = self._format_summary_stats(summary_stats)
            
            # Build prompt
            prompt = self._build_prompt(
                session_id=session_id,
                vehicle_id=vehicle_id,
                race_events_text=race_events_text,
                summary_stats_text=summary_stats_text
            )
            
            logger.info(f"Generating race story for session {session_id}, vehicle {vehicle_id}")
            logger.debug(f"Prompt: {prompt[:200]}...")
            
            # Call Gemini using the new API
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                story = response.text.strip()
                logger.info(f"Successfully generated race story for session {session_id}")
                return story
            
            logger.warning("Empty response from Gemini.")
            return "Unable to generate race story at this time."
        
        except Exception as e:
            logger.error(f"Error generating race story: {e}", exc_info=True)
            return f"Story generation failed: {str(e)}"
    
    def _format_race_events(self, race_events: List[Dict[str, Any]]) -> str:
        """Format race events into readable text"""
        if not race_events:
            return "No significant events recorded."
        
        lines = []
        for event in race_events:
            lap = event.get("lap", "?")
            event_text = event.get("event", "Unknown event")
            lines.append(f"Lap {lap}: {event_text}")
        
        return "\n".join(lines)
    
    def _format_summary_stats(self, summary_stats: Dict[str, Any]) -> str:
        """Format summary statistics into readable text"""
        lines = []
        
        # Total laps
        if "total_laps" in summary_stats:
            lines.append(f"Total Laps: {summary_stats['total_laps']}")
        
        # Best lap
        if "best_lap" in summary_stats:
            best_lap = summary_stats['best_lap']
            if isinstance(best_lap, float):
                lines.append(f"Best Lap Time: {best_lap:.3f}s")
            else:
                lines.append(f"Best Lap Time: {best_lap}")
        
        # Average lap time
        if "avg_lap_time" in summary_stats:
            avg_lap = summary_stats['avg_lap_time']
            if isinstance(avg_lap, float):
                lines.append(f"Average Lap Time: {avg_lap:.3f}s")
            else:
                lines.append(f"Average Lap Time: {avg_lap}")
        
        # Pit stops
        if "pit_stops" in summary_stats:
            lines.append(f"Pit Stops: {summary_stats['pit_stops']}")
        
        # Max speed
        if "max_speed" in summary_stats:
            max_speed = summary_stats['max_speed']
            if isinstance(max_speed, float):
                lines.append(f"Max Speed: {max_speed:.1f} km/h")
            else:
                lines.append(f"Max Speed: {max_speed} km/h")
        
        # Final position
        if "final_position" in summary_stats:
            lines.append(f"Final Position: {summary_stats['final_position']}")
        
        # Weather summary
        if "weather_summary" in summary_stats:
            lines.append(f"Weather: {summary_stats['weather_summary']}")
        
        # Tire strategy
        if "tire_strategy" in summary_stats:
            lines.append(f"Tire Strategy: {summary_stats['tire_strategy']}")
        
        return "\n".join(lines) if lines else "No statistics available."
    
    def _build_prompt(
        self,
        session_id: str,
        vehicle_id: int,
        race_events_text: str,
        summary_stats_text: str
    ) -> str:
        """Build the prompt for Gemini to generate the race story"""
        
        return f"""You are a Formula 1 race analyst and journalist.

Create a post-race story for car #{vehicle_id} in session {session_id}.

Key race events (lap by lap highlights):
{race_events_text}

Race statistics:
{summary_stats_text}

Write a 5–8 sentence race story describing:
- Overall pace trends and performance
- Key lap events and moments
- Pit strategy and tire performance
- Effects of track conditions and weather
- Important battles or overtakes
- Final result and overall assessment

Tone: professional, exciting, and clear. Write as if you're summarizing the race for fans.

Race Story:"""
