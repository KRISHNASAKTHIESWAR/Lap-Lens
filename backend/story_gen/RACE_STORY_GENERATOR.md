# Race Story Generator - Feature Documentation

## Overview

The **Race Story Generator** is a new feature that uses the Gemini API to generate natural-language post-race narratives for Formula 1 sessions. After a race session ends, you can provide key events and statistics, and the system will generate an engaging 5-8 sentence story summarizing the race.

## Architecture

### Components

```
RaceStoryGenerator Service
├─ __init__()              Load Gemini API key and initialize model
├─ is_available()          Check if API is configured
├─ generate_story()        Main method to generate race narrative
├─ _format_race_events()   Convert events to readable text
├─ _format_summary_stats() Convert stats to readable text
└─ _build_prompt()         Construct the Gemini prompt

API Endpoint
├─ POST /api/race/story    Accept race data, call generator, return story

Request Schemas
├─ RaceEvent              Individual lap event
├─ RaceStoryRequest       Full story generation request
└─ RaceStoryResponse      Generated story response
```

## Files Modified/Created

### New Files
- `app/services/race_story.py` - RaceStoryGenerator service class
- `example_race_story_client.py` - Example client usage

### Modified Files
- `app/schemas/prediction.py` - Added RaceEvent, RaceStoryRequest, RaceStoryResponse schemas
- `app/api/routes.py` - Added POST /race/story endpoint, imported RaceStoryGenerator

### Unchanged
- All other files remain unchanged
- Training pipeline unaffected
- Prediction endpoints unaffected

## API Endpoint

### POST `/api/race/story`

Generate a post-race narrative story for a specific vehicle.

**Request Body:**
```json
{
  "session_id": "race_abc123",
  "vehicle_id": 1,
  "race_events": [
    {
      "lap": 1,
      "event": "Strong start, gained 2 positions"
    },
    {
      "lap": 12,
      "event": "Tire degradation noticed, lap time dropped"
    },
    {
      "lap": 23,
      "event": "Pit stop, switched to mediums"
    }
  ],
  "summary_stats": {
    "total_laps": 58,
    "best_lap": 82.456,
    "avg_lap_time": 85.234,
    "pit_stops": 2,
    "max_speed": 310.5,
    "final_position": 3,
    "weather_summary": "Clear skies, 25°C track temp",
    "tire_strategy": "Soft-Medium-Medium"
  }
}
```

**Response:**
```json
{
  "session_id": "race_abc123",
  "vehicle_id": 1,
  "story": "Car #1 delivered a dominant performance at Monaco today, showcasing excellent tire management and racecraft. The driver made a strong start, gaining two positions in the opening lap and maintaining composure through intense midfield battles. A well-timed pit stop at lap 23 to switch to medium tires proved strategically sound, with the fresh rubber providing better pace for the middle stint. Tire degradation became apparent around lap 12, but the team adapted with aggressive pit strategy. Despite weather-related concerns that never materialized, the team executed a flawless strategy with two stops. The final push saw the driver consolidate third place with clinical precision, avoiding unnecessary risks while maintaining performance. A masterclass in consistency and strategy that perfectly balanced aggression and caution throughout the 58-lap encounter."
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | The race session identifier |
| `vehicle_id` | integer | Vehicle number |
| `story` | string | The AI-generated race narrative (5-8 sentences) |

## Request Fields

### `race_events` (array of objects)

List of notable events during the race, one per lap or only for significant moments.

```json
{
  "lap": 15,
  "event": "First pit stop executed - switched from soft to medium tires"
}
```

**Event Examples:**
- "Strong start, gained 2 positions off the line"
- "First pit stop, switched to medium tires"
- "Tire degradation noticed"
- "Overtook car #7 on the inside at turn 3"
- "Second pit stop, switched to hard tires"
- "Late-race safety car deployment"
- "Defended position against pursuing car"
- "Crossed the finish line in 3rd place"

### `summary_stats` (object)

Race statistics and metadata. All fields are optional but provide context for the story.

```json
{
  "total_laps": 58,
  "best_lap": 82.456,
  "avg_lap_time": 85.234,
  "pit_stops": 2,
  "max_speed": 310.5,
  "final_position": 3,
  "weather_summary": "Clear skies, 25°C track temp",
  "tire_strategy": "Soft-Medium-Hard"
}
```

**Available Fields:**
- `total_laps` (int) - Total laps completed
- `best_lap` (float) - Best lap time in seconds
- `avg_lap_time` (float) - Average lap time in seconds
- `pit_stops` (int) - Number of pit stops
- `max_speed` (float) - Maximum speed in km/h
- `final_position` (int) - Final finishing position
- `weather_summary` (string) - Weather conditions and track temperature
- `tire_strategy` (string) - Tire compound strategy (e.g., "Soft-Medium-Hard")

## Story Generation

### Tone and Style

The generated story combines:
- **Technical Analysis**: lap times, pit strategy, tire performance
- **Narrative Flow**: race progression, key moments, turning points
- **Journalism**: engaging language, drama, context
- **Racing Expertise**: strategy assessment, performance evaluation

### Length

Stories are designed to be **5-8 sentences** (~250-400 words), providing:
- Quick summary of performance
- Key strategic decisions
- Notable moments or battles
- Weather/track conditions impact
- Final assessment and result

### Example Story

> "Car #1 delivered a brilliant performance under pressure at Monaco, demonstrating superior tire management and tactical racing throughout the 65-lap encounter. The driver made an aggressive start, gaining two positions in the opening lap and holding ground through several intense midfield skirmishes that tested both car setup and racecraft. A perfectly-timed first pit stop on lap 15 to transition from soft to medium compound proved crucial, as tire degradation became apparent from lap 22 onwards, but the strategic switch mitigated the pace loss. The clear skies and steady track temperature of 25°C worked in the team's favor, allowing for straightforward strategy execution with two stops total. A spirited late-race challenge saw the driver recover one position in the final stint on fresh hard tires, ultimately bringing the car home in a strong third place—a result that balanced risk management with aggressive performance."

## Implementation Details

### Service Class: RaceStoryGenerator

Located in `app/services/race_story.py`

```python
from app.services.race_story import RaceStoryGenerator

# Initialize
generator = RaceStoryGenerator()

# Check availability
if generator.is_available():
    story = generator.generate_story(
        session_id="race_123",
        vehicle_id=1,
        race_events=[...],
        summary_stats={...}
    )
```

### Prompt Template

The service builds a context-aware prompt for Gemini:

```
You are a Formula 1 race analyst and journalist.

Create a post-race story for car #{vehicle_id} in session {session_id}.

Key race events (lap by lap highlights):
[formatted race events]

Race statistics:
[formatted summary stats]

Write a 5–8 sentence race story describing:
- Overall pace trends and performance
- Key lap events and moments
- Pit strategy and tire performance
- Effects of track conditions and weather
- Important battles or overtakes
- Final result and overall assessment

Tone: professional, exciting, and clear.
```

### Error Handling

The service includes graceful error handling:

1. **Missing API Key**: Returns explanatory message
2. **API Errors**: Catches exceptions and returns error message with details
3. **Empty Events**: Handles cases with no race events gracefully
4. **Empty Stats**: Works with partial or missing statistics

## Usage Examples

### Example 1: Basic Usage with cURL

```bash
curl -X POST http://localhost:8000/api/race/story \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "race_12345",
    "vehicle_id": 1,
    "race_events": [
      {"lap": 1, "event": "Strong start"},
      {"lap": 25, "event": "Pit stop"}
    ],
    "summary_stats": {
      "total_laps": 50,
      "best_lap": 80.5,
      "final_position": 3
    }
  }'
```

### Example 2: Python Client

```python
import requests

response = requests.post(
    "http://localhost:8000/api/race/story",
    json={
        "session_id": "race_12345",
        "vehicle_id": 1,
        "race_events": [
            {"lap": 1, "event": "Strong start, gained 2 positions"},
            {"lap": 23, "event": "Pit stop, switched to mediums"}
        ],
        "summary_stats": {
            "total_laps": 58,
            "best_lap": 82.456,
            "avg_lap_time": 85.234,
            "pit_stops": 2,
            "max_speed": 310.5,
            "final_position": 3,
            "weather_summary": "Clear skies, 25°C track temp"
        }
    }
)

print(response.json()["story"])
```

### Example 3: Using the Example Client

```bash
# Run the provided example client
python example_race_story_client.py
```

This will:
1. Create a test session
2. Generate a sample race story
3. Display the narrative

## Configuration

### Environment Variables

```bash
# Required
export GEMINI_API_KEY=your-api-key-from-ai.google.dev

# Optional (defaults shown)
export GEMINI_MODEL=gemini-2.0-flash
```

### Setting in .env File

```env
# Gemini API Configuration
GEMINI_API_KEY=AIzaSyAc9nLN-jFCTzfOix_6nPJAk1Sq2dOy82g
GEMINI_MODEL=gemini-2.0-flash
```

## Performance Considerations

### Response Time

- **Story Generation**: 2-4 seconds (Gemini API latency)
- **Total Endpoint Time**: 2-5 seconds

### API Costs

- Each request calls Gemini API
- Billing based on tokens used
- Monitor usage for cost management

### Optimization Tips

1. **Batch Stories**: Generate multiple stories in sequence rather than parallel calls
2. **Cache Results**: Cache stories in session storage or database
3. **Async Processing**: Consider background task for story generation
4. **Token Limits**: Ensure race events and stats fit within context window

## Logging

The service provides detailed logging:

```
INFO: RaceStoryGenerator initialized with Gemini model: gemini-2.0-flash
INFO: Generating race story for session race_abc123, vehicle 1
INFO: Successfully generated race story for session race_abc123
DEBUG: Story preview: Car #1 delivered a brilliant performance...
```

Check logs for:
- API initialization status
- Story generation requests
- Success/failure status
- Story preview (first 200 chars)

## Testing

### Test via Swagger UI

1. Start the API: `python -m uvicorn app.main:app --reload`
2. Open `http://localhost:8000/docs`
3. Find `POST /api/race/story`
4. Click "Try it out"
5. Enter test JSON payload
6. Click "Execute"

### Test via Python Script

```python
from example_race_story_client import generate_race_story, create_test_session

session_id = create_test_session()
generate_race_story(session_id)
```

### Test via cURL

See "Usage Examples" section above for cURL commands.

## Troubleshooting

### Error: "Story unavailable: Gemini API key not configured"

**Solution**: Set `GEMINI_API_KEY` environment variable

```bash
export GEMINI_API_KEY=your-key-here
```

### Error: "Story generation failed: ..."

**Solution**: Check API key validity and quota

```bash
# Verify API key works
curl https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY
```

### Error: "Session not found"

**Solution**: Ensure session was created before generating story

```bash
# Create session first
curl -X POST http://localhost:8000/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"vehicle_id": 1, "race_name": "Monaco GP"}'
```

### Slow Response Times

**Solution**: Gemini API latency is normal (2-4 seconds)

- Use async endpoints if available
- Implement caching for repeated requests
- Consider batch processing

## Future Enhancements

Potential improvements for future versions:

1. **Multi-Driver Stories**: Generate narratives for multiple vehicles in single race
2. **Comparative Analysis**: Compare performance of different drivers/teams
3. **Story Templates**: Allow custom story templates or styles
4. **Video Integration**: Include race telemetry data and video highlights
5. **Async Processing**: Background task for long-running story generation
6. **Caching**: Store stories in database for retrieval
7. **Analytics**: Track story generation usage and API costs
8. **Custom Prompts**: Allow users to provide custom story instructions

## Integration with Existing Features

The Race Story Generator is **fully independent**:

- ✅ Works alongside prediction endpoints
- ✅ Doesn't affect training pipeline
- ✅ Uses same ExplainAI infrastructure (ExplainAI + Gemini)
- ✅ Sessions enhanced with story storage
- ✅ No breaking changes to existing APIs

## Support and Questions

For issues or questions:

1. Check logs for error messages
2. Verify Gemini API key and quota
3. Review example client code
4. Test with Swagger UI at `/docs`
5. Check this documentation

## Automatic race story generator

POST /api/generate-race-story-auto

This endpoint generates a post-race story automatically using all predictions stored in the session, without requiring you to manually provide race_events or summary_stats. The system extracts events and calculates summary statistics internally.

Request Body:

{
  "session_id": "race_8732362887cc",
  "vehicle_id": 1
}


Response:

{
  "session_id": "race_8732362887cc",
  "vehicle_id": 1,
  "story": "Car #1 experienced a perplexing race in session race_8732362887cc, ultimately failing to finish despite seemingly competitive pace. The team opted for an aggressive two-stop strategy, both stops occurring on consecutive laps, 27 and 28, switching to the Medium compound each time. The decision to pit twice in quick succession is unusual and undoubtedly impacted the race strategy, though the reason behind it remains unclear. The clear weather conditions offered no excuse, suggesting the issues were internal to the car or team strategy. Despite setting a best and average lap time of 81.377s, the car's maximum speed was recorded as 0.0 km/h. Overall, a deeply disappointing result, leaving fans wondering what could have been."
}

Behavior and Advantages

Fetches all predictions (lap_time, pit_imminent, tire_compound) from the session automatically.

Calls extract_race_events() to detect significant race moments (pit stops, tire degradation, pace changes, incidents).

Calls calculate_summary_stats() to produce lap statistics, pit counts, and performance metrics.

Passes the extracted events and summary stats to the RaceStoryGenerator to create a narrative.

Eliminates the need to manually craft the race_events or summary_stats JSON.

When to Use

Use this endpoint when you just want the story for a session and already have predictions recorded.

Ideal for dashboards, live race summaries, or automated reporting.

Recommended Integration

Call after session predictions have been made and stored.

Output story can be displayed directly in your app or dashboard without manual preprocessing.

Example Python Client:

import requests

response = requests.post(
    "http://localhost:8000/api/generate-race-story-auto",
    json={
        "session_id": "race_8732362887cc",
        "vehicle_id": 1
    }
)

print(response.json()["story"])


Tip: This endpoint is perfect for automation and eliminates manual input errors. It is recommended for displaying race stories directly in UI or reports.

## Summary

The Race Story Generator provides an engaging way to summarize race sessions using AI. It:

✅ Generates natural-language race narratives
✅ Combines technical analysis with storytelling
✅ Integrates seamlessly with existing API
✅ Provides detailed logging and error handling
✅ Uses proven Gemini API infrastructure
✅ Includes example clients for testing

Ready to generate compelling race stories! 🏁
