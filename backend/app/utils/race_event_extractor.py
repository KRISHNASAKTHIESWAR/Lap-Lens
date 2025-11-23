"""
Utility to extract race events from session prediction history
"""
import logging
from typing import List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


def extract_race_events(session_predictions: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """
    Extract notable race events from session prediction history.
    
    Args:
        session_predictions: List of predictions from a session
        
    Returns:
        List of race events with lap number and description
    """
    race_events = []
    
    if not session_predictions:
        logger.warning("No predictions found in session")
        return race_events
    
    prev_lap_time = None
    prev_pit_imminent = False
    
    for pred in session_predictions:
        try:
            prediction_type = pred.get('type')
            result = pred.get('result', {})
            
            if prediction_type == 'lap_time':
                lap = result.get('lap')
                lap_time = result.get('predicted_lap_time')
                confidence = result.get('confidence', 0)
                
                # Detect pace changes
                if prev_lap_time and lap_time:
                    time_delta = lap_time - prev_lap_time
                    
                    if time_delta < -0.5:  # Significant improvement
                        event = f"Strong pace improvement, lap time dropped {abs(time_delta):.2f}s"
                        race_events.append({"lap": lap, "event": event})
                    elif time_delta > 1.0:  # Significant degradation
                        event = f"Tire degradation noticed, lap time increased {time_delta:.2f}s"
                        race_events.append({"lap": lap, "event": event})
                    elif confidence < 0.4:  # Low confidence (possible traffic/incident)
                        event = f"Traffic detected or incident, lap time inconsistent"
                        race_events.append({"lap": lap, "event": event})
                
                prev_lap_time = lap_time
            
            elif prediction_type == 'pit_imminent':
                lap = result.get('lap')
                pit_imminent = result.get('pit_imminent')
                probability = result.get('probability', 0)
                
                # Detect pit stop preparation
                if pit_imminent and not prev_pit_imminent and probability > 0.7:
                    event = f"Pit stop imminent - high tire degradation detected"
                    race_events.append({"lap": lap, "event": event})
                    prev_pit_imminent = True
                elif not pit_imminent:
                    prev_pit_imminent = False
            
            elif prediction_type == 'tire_compound':
                lap = result.get('lap')
                compound = result.get('suggested_compound')
                event = f"Pit stop executed - switched to {compound} tires"
                race_events.append({"lap": lap, "event": event})
        
        except Exception as e:
            logger.warning(f"Error processing prediction: {e}")
            continue
    
    logger.info(f"Extracted {len(race_events)} race events")
    return race_events


def calculate_summary_stats(
    session_data: Dict[str, Any],
    session_predictions: List[Dict[str, Any]],
    weather_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Calculate summary statistics for a race session.
    
    Args:
        session_data: Session information
        session_predictions: List of predictions from session
        weather_data: Optional weather information
        
    Returns:
        Dictionary with summary statistics
    """
    summary_stats = {
        "total_laps": 0,
        "best_lap": float('inf'),
        "avg_lap_time": 0.0,
        "pit_stops": 0,
        "max_speed": 0.0,
        "final_position": None,
        "weather_summary": "Clear skies"
    }
    
    lap_times = []
    max_speeds = []
    pit_count = 0
    
    for pred in session_predictions:
        prediction_type = pred.get('type')
        result = pred.get('result', {})
        
        try:
            if prediction_type == 'lap_time':
                lap_time = result.get('predicted_lap_time')
                if lap_time:
                    lap_times.append(lap_time)
                    summary_stats['best_lap'] = min(summary_stats['best_lap'], lap_time)
                    summary_stats['total_laps'] = max(summary_stats['total_laps'], result.get('lap', 0))
            
            elif prediction_type == 'tire_compound':
                # Count pit stops
                pit_count += 1
            
            # Extract max speed if available in request data
            if 'max_speed' in result:
                max_speeds.append(result['max_speed'])
        
        except Exception as e:
            logger.warning(f"Error calculating stats: {e}")
            continue
    
    # Calculate averages
    if lap_times:
        summary_stats['avg_lap_time'] = sum(lap_times) / len(lap_times)
        summary_stats['best_lap'] = round(summary_stats['best_lap'], 3)
        summary_stats['avg_lap_time'] = round(summary_stats['avg_lap_time'], 3)
    
    if max_speeds:
        summary_stats['max_speed'] = round(max(max_speeds), 1)
    
    summary_stats['pit_stops'] = pit_count
    
    # Add weather information if provided
    if weather_data:
        air_temp = weather_data.get('air_temp', 20)
        track_temp = weather_data.get('track_temp', 30)
        humidity = weather_data.get('humidity', 50)
        rain = weather_data.get('rain', False)
        wind_speed = weather_data.get('wind_speed', 0)
        
        weather_str = f"{'Rainy' if rain else 'Clear'} skies, "
        weather_str += f"track temp {track_temp}°C, air temp {air_temp}°C, "
        weather_str += f"{humidity}% humidity, wind {wind_speed} km/h"
        summary_stats['weather_summary'] = weather_str
    
    logger.info(f"Summary stats: {summary_stats['total_laps']} laps, "
                f"best: {summary_stats['best_lap']}s, "
                f"avg: {summary_stats['avg_lap_time']}s")
    
    return summary_stats