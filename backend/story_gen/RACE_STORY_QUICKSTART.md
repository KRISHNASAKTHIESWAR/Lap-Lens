# Race Story Generator - Quick Start Guide

## Installation

The Race Story Generator is now integrated into your API. No additional dependencies needed (uses existing Gemini API setup).

## Files Added/Modified

### ✨ New Files
- `app/services/race_story.py` - RaceStoryGenerator service
- `example_race_story_client.py` - Example client for testing
- `RACE_STORY_GENERATOR.md` - Full feature documentation

### 🔧 Modified Files
- `app/schemas/prediction.py` - Added RaceEvent, RaceStoryRequest, RaceStoryResponse
- `app/api/routes.py` - Added POST /race/story endpoint

## Quick Start (5 minutes)

### 1. Verify Gemini API Key

```bash
# Check .env file has the key
cat .env | grep GEMINI_API_KEY

# Or set it if missing
export GEMINI_API_KEY=your-key-from-ai.google.dev
```

### 2. Start the API

```bash
python -m uvicorn app.main:app --reload
```

### 3. Test the Endpoint

Open your browser and visit:
```
http://localhost:8000/docs
```

Find **POST /api/race/story** and click "Try it out"

### 4. Submit Test Data

```json
{
  "session_id": "race_test_123",
  "vehicle_id": 1,
  "race_events": [
    {"lap": 1, "event": "Strong start, gained 2 positions"},
    {"lap": 15, "event": "First pit stop, switched to mediums"},
    {"lap": 45, "event": "Second pit stop, switched to hards"},
    {"lap": 58, "event": "Crossed finish line in 3rd place"}
  ],
  "summary_stats": {
    "total_laps": 58,
    "best_lap": 82.456,
    "avg_lap_time": 85.234,
    "pit_stops": 2,
    "max_speed": 310.5,
    "final_position": 3,
    "weather_summary": "Clear skies, 25°C track temperature",
    "tire_strategy": "Soft-Medium-Hard"
  }
}
```

### 5. Click "Execute"

The API will generate a race story for you! 🎉

## Using Python Client

```bash
# Run the example client
python example_race_story_client.py
```

This will:
1. Create a test session
2. Generate a sample race story
3. Display the narrative

## Using cURL

```bash
curl -X POST http://localhost:8000/api/race/story \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "race_123",
    "vehicle_id": 1,
    "race_events": [
      {"lap": 1, "event": "Strong start"},
      {"lap": 25, "event": "Pit stop"}
    ],
    "summary_stats": {
      "total_laps": 50,
      "best_lap": 82.5,
      "final_position": 3
    }
  }'
```

## Required vs Optional Fields

### Required
- `session_id` - Your race session identifier
- `vehicle_id` - Vehicle/car number
- `race_events` - List of race events
- `summary_stats` - Race statistics object

### Optional (but recommended for better stories)
In `summary_stats`:
- `total_laps`
- `best_lap`
- `avg_lap_time`
- `pit_stops`
- `max_speed`
- `final_position`
- `weather_summary`
- `tire_strategy`

## API Response Format

```json
{
  "session_id": "race_123",
  "vehicle_id": 1,
  "story": "Car #1 delivered a masterclass performance today..."
}
```

The `story` field contains the AI-generated narrative (5-8 sentences).

## Example Race Events

```python
[
    {"lap": 1, "event": "Strong start, gained 2 positions off the line"},
    {"lap": 8, "event": "Intense midfield battle, held position"},
    {"lap": 15, "event": "First pit stop - switched from soft to medium tires"},
    {"lap": 22, "event": "Tire degradation noticed, pace slightly slower"},
    {"lap": 35, "event": "Defended aggressively against pursuing car"},
    {"lap": 45, "event": "Second pit stop - switched to hard tires"},
    {"lap": 53, "event": "Late-race pace push, recovering lost positions"},
    {"lap": 58, "event": "Crossed the finish line in 3rd place"}
]
```

## Common Issues & Solutions

### Issue: "Story unavailable: Gemini API key not configured"

**Solution**: Set your API key
```bash
export GEMINI_API_KEY=your-key-here
```

### Issue: "Session not found"

**Solution**: Create a session first or use an existing session ID
```bash
# Create a session
curl -X POST http://localhost:8000/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"vehicle_id": 1, "race_name": "Test Race"}'
```

### Issue: Slow response (2-4 seconds)

**Normal!** Gemini API calls take time. This is expected behavior.

### Issue: Empty story response

**Check**:
1. Gemini API key is valid
2. API has internet access
3. No API quota exceeded
4. Check server logs for errors

## Next Steps

1. ✅ Test with example client
2. ✅ Try Swagger UI at `/docs`
3. ✅ Integrate into your application
4. ✅ Monitor API usage and costs
5. ✅ Read full documentation: `RACE_STORY_GENERATOR.md`

## Features Summary

✨ **Race Story Generator**
- Generates 5-8 sentence race narratives
- Uses Gemini API for AI generation
- Combines technical + journalistic tone
- Supports multiple race statistics
- Includes error handling and logging
- Works with existing session system
- No additional dependencies needed

## Architecture

```
Your Application
       ↓
POST /api/race/story
       ↓
RaceStoryGenerator Service
       ↓
Gemini API (Google)
       ↓
Return Story
```

## Performance

- **Response Time**: 2-4 seconds (typical)
- **Story Length**: 5-8 sentences (~300 words)
- **API Calls**: 1 per request
- **Cost**: Per-token billing with Gemini

## Support

See `RACE_STORY_GENERATOR.md` for:
- Detailed API documentation
- Architecture details
- Troubleshooting guide
- Examples and use cases
- Future enhancement ideas

---

## Summary

✅ New `POST /api/race/story` endpoint ready
✅ Generate AI-powered race narratives
✅ Fully integrated with existing system
✅ Tested and documented

**Start generating race stories now!** 🏁🎯
