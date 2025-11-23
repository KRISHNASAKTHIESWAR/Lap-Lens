#!/usr/bin/env python
"""
Example client for Race Story Generator API
Demonstrates how to call the new /race/story endpoint
Shows how to extract race events from session history
"""
import requests
import json
from typing import List, Dict, Any

# API base URL
BASE_URL = "http://localhost:8000/api"

def create_test_session():
    """Create a test session first"""
    response = requests.post(
        f"{BASE_URL}/session/create",
        params={"vehicle_id": 1, "race_name": "Monaco GP"}
    )
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Session created: {data['session_id']}")
        return data['session_id']
    else:
        print(f"❌ Failed to create session: {response.status_code}")
        return None


def get_session_predictions(session_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve all predictions from a session.
    This is what you do after the race ends to collect all race events.
    """
    response = requests.get(f"{BASE_URL}/session/{session_id}/predictions")
    
    if response.status_code == 200:
        data = response.json()
        predictions = data.get('predictions', [])
        print(f"\n📊 Retrieved {len(predictions)} predictions from session")
        return predictions
    else:
        print(f"❌ Failed to retrieve predictions: {response.status_code}")
        return []


def extract_race_events_from_predictions(predictions: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """
    Extract race events from prediction history.
    Analyzes lap time trends, pit stops, tire degradation, etc.
    """
    race_events = []
    prev_lap_time = None
    pit_stop_count = 0
    
    for pred in predictions:
        prediction_type = pred.get('type')
        result = pred.get('result', {})
        
        try:
            if prediction_type == 'lap_time':
                lap = result.get('lap')
                lap_time = result.get('predicted_lap_time')
                confidence = result.get('confidence', 0)
                explanation = result.get('explanation', '')
                
                # Detect pace changes
                if prev_lap_time and lap_time:
                    time_delta = lap_time - prev_lap_time
                    
                    if time_delta < -0.5:  # Significant improvement
                        event = f"Strong pace improvement, recovered pace with cleaner traffic"
                        race_events.append({"lap": lap, "event": event})
                    elif time_delta > 1.0:  # Significant degradation
                        event = f"Tire degradation noticed, lap time increasing noticeably"
                        race_events.append({"lap": lap, "event": event})
                    elif confidence < 0.4:  # Low confidence (traffic/incident)
                        event = f"Traffic on track, catching backmarkers"
                        race_events.append({"lap": lap, "event": event})
                
                prev_lap_time = lap_time
            
            elif prediction_type == 'pit_imminent':
                lap = result.get('lap')
                pit_imminent = result.get('pit_imminent')
                probability = result.get('probability', 0)
                
                # Detect pit stop preparation
                if pit_imminent and probability > 0.7:
                    event = f"Pit stop window detected - high tire degradation"
                    race_events.append({"lap": lap, "event": event})
            
            elif prediction_type == 'tire_compound':
                lap = result.get('lap')
                compound = result.get('suggested_compound')
                pit_stop_count += 1
                event = f"Pit stop #{pit_stop_count} executed - switched to {compound} tires"
                race_events.append({"lap": lap, "event": event})
        
        except Exception as e:
            print(f"⚠️ Error processing prediction: {e}")
            continue
    
    print(f"✅ Extracted {len(race_events)} race events")
    return race_events


def calculate_summary_stats(predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate summary statistics from predictions.
    """
    summary_stats = {
        "total_laps": 0,
        "best_lap": float('inf'),
        "avg_lap_time": 0.0,
        "pit_stops": 0,
        "max_speed": 0.0,
        "final_position": "Finished",
        "weather_summary": "Clear skies with scattered clouds, track temperature 25°C, 45% humidity",
        "tire_strategy": "Strategic pit stops for tire management"
    }
    
    lap_times = []
    pit_count = 0
    max_laps = 0
    
    for pred in predictions:
        prediction_type = pred.get('type')
        result = pred.get('result', {})
        
        try:
            if prediction_type == 'lap_time':
                lap_time = result.get('predicted_lap_time')
                lap = result.get('lap', 0)
                
                if lap_time:
                    lap_times.append(lap_time)
                    summary_stats['best_lap'] = min(summary_stats['best_lap'], lap_time)
                    max_laps = max(max_laps, lap)
            
            elif prediction_type == 'tire_compound':
                pit_count += 1
        
        except Exception as e:
            print(f"⚠️ Error calculating stats: {e}")
            continue
    
    # Calculate averages
    if lap_times:
        summary_stats['total_laps'] = max_laps
        summary_stats['best_lap'] = round(summary_stats['best_lap'], 3)
        summary_stats['avg_lap_time'] = round(sum(lap_times) / len(lap_times), 3)
    
    summary_stats['pit_stops'] = pit_count
    
    print(f"✅ Calculated stats: {summary_stats['total_laps']} laps, "
          f"best lap {summary_stats['best_lap']}s")
    
    return summary_stats


def generate_race_story(session_id: str, vehicle_id: int, race_events: List[Dict], summary_stats: Dict):
    """Generate a race story for a session"""
    
    print("\n📝 Requesting race story generation...")
    print(f"   Events: {len(race_events)} key moments")
    print(f"   Total laps: {summary_stats['total_laps']}")
    print(f"   Best lap: {summary_stats['best_lap']}s")
    
    # Create request payload
    payload = {
        "session_id": session_id,
        "vehicle_id": vehicle_id,
        "race_events": race_events,
        "summary_stats": summary_stats
    }
    
    response = requests.post(
        f"{BASE_URL}/race/story",
        json=payload
    )
    
    if response.status_code == 200:
        data = response.json()
        print("\n✅ Race story generated successfully!\n")
        print("=" * 80)
        print(f"SESSION: {data['session_id']}")
        print(f"VEHICLE: #{data['vehicle_id']}")
        print("=" * 80)
        print(f"\n{data['story']}\n")
        print("=" * 80)
        return data
    else:
        print(f"❌ Failed to generate story: {response.status_code}")
        print(f"   Error: {response.text}")
        return None


def main():
    """Main example flow"""
    print("🏁 Formula 1 Race Story Generator - Example Client\n")
    print("=" * 80)
    print("WORKFLOW:")
    print("1. Create a session")
    print("2. Make predictions (lap time, pit, tire) throughout the race")
    print("3. After race ends, retrieve all predictions from session")
    print("4. Extract race events from prediction history")
    print("5. Generate a narrative race story with Gemini AI")
    print("=" * 80)
    
    # Step 1: Create session
    session_id = create_test_session()
    if not session_id:
        return
    
    # Step 2: Simulate getting predictions
    # In a real scenario, you would have called /predict/lap-time, /predict/pit, 
    # /predict/tire multiple times during the race
    print("\n⏳ Simulating race with predictions...")
    print("   (In production, these come from actual /predict/* calls during the race)")
    
    # Retrieve predictions from session
    predictions = get_session_predictions(session_id)
    
    if not predictions:
        print("\n💡 No predictions yet. Creating sample race data...")
        # For demo purposes, create sample events
        race_events = [
            {"lap": 1, "event": "Strong start, gained 2 positions off the line"},
            {"lap": 8, "event": "Held position through intense midfield battle"},
            {"lap": 15, "event": "First pit stop executed - switched from soft to medium tires"},
            {"lap": 22, "event": "Tire degradation noticed, pace slightly dropped"},
            {"lap": 35, "event": "Aggressive defense against faster car behind"},
            {"lap": 45, "event": "Second pit stop, switched to hard tires for final stint"},
            {"lap": 53, "event": "Late-race push, recovered one position"},
            {"lap": 65, "event": "Crossed the finish line in 3rd place"}
        ]
        summary_stats = {
            "total_laps": 65,
            "best_lap": 82.456,
            "avg_lap_time": 85.234,
            "pit_stops": 2,
            "max_speed": 310.5,
            "final_position": 3,
            "weather_summary": "Clear skies with scattered clouds, track temperature 25°C, 45% humidity"
        }
    else:
        # Step 3: Extract race events from predictions
        race_events = extract_race_events_from_predictions(predictions)
        
        # Step 4: Calculate summary statistics
        summary_stats = calculate_summary_stats(predictions)
    
    # Step 5: Generate race story
    story_data = generate_race_story(session_id, 1, race_events, summary_stats)
    
    if story_data:
        print("\n✨ Race story generation complete!")
        print("\nYou can now close the session:")
        print(f"   POST {BASE_URL}/session/{session_id}/close")
    else:
        print("❌ Race story generation failed")


if __name__ == "__main__":
    main()
