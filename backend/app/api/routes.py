"""
API routes for predictions
"""
import logging
import uuid
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.schemas.prediction import (
    PredictionRequest, LapTimeResponse, PitImminentResponse,
    TireCompoundResponse, AllPredictionsResponse, RaceStoryRequest, RaceStoryResponse, RaceStoryRequestAuto
)
from app.schemas.session import SessionResponse, SessionErrorResponse
from app.services.inference import InferenceEngine
from app.services.explain_ai import ExplainAI
from app.services.race_story import RaceStoryGenerator
from app.utils.preprocess import validate_input_data
from app.core.config import NUMERIC_FEATURES
from app.utils.race_event_extractor import extract_race_events, calculate_summary_stats

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize ExplainAI engine
explain_ai = ExplainAI()

# Initialize RaceStoryGenerator engine
race_story_generator = RaceStoryGenerator()


# Global session storage (in production, use a database)
sessions: Dict[str, Dict[str, Any]] = {}

# Initialize inference engine
inference_engine = InferenceEngine()


@router.post("/session/create", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(vehicle_id: int, race_name: str = "Race 1") -> SessionResponse:
    """
    Create a new prediction session.
    
    Args:
        vehicle_id: Vehicle identifier
        race_name: Name of the race/event
    
    Returns:
        SessionResponse with unique session ID
    """
    try:
        session_id = f"race_{uuid.uuid4().hex[:12]}"
        
        session_data = {
            'session_id': session_id,
            'vehicle_id': vehicle_id,
            'race_name': race_name,
            'created_at': datetime.utcnow(),
            'status': 'active',
            'predictions': []
        }
        
        sessions[session_id] = session_data
        
        logger.info(f"Created session {session_id} for vehicle {vehicle_id}")
        
        return SessionResponse(
            session_id=session_id,
            vehicle_id=vehicle_id,
            race_name=race_name,
            created_at=datetime.utcnow(),
            status='active'
        )
        
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}"
        )


@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str) -> SessionResponse:
    """
    Get session information.
    
    Args:
        session_id: Session identifier
    
    Returns:
        SessionResponse with session information
    """
    if session_id not in sessions:
        logger.warning(f"Session not found: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    session = sessions[session_id]
    return SessionResponse(
        session_id=session['session_id'],
        vehicle_id=session['vehicle_id'],
        race_name=session['race_name'],
        created_at=session['created_at'],
        status=session['status']
    )


@router.post("/predict/lap-time", response_model=LapTimeResponse)
async def predict_lap_time(request: PredictionRequest) -> LapTimeResponse:
    """
    Predict lap time with explanation.
    
    Args:
        request: PredictionRequest with telemetry data
    
    Returns:
        LapTimeResponse with prediction and explanation
    """
    try:
        # Validate session
        if request.session_id not in sessions:
            logger.warning(f"Invalid session: {request.session_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {request.session_id} not found"
            )
        
        # Validate input
        request_dict = request.model_dump()
        is_valid, error_msg = validate_input_data(request_dict, NUMERIC_FEATURES)
        if not is_valid:
            logger.warning(f"Invalid input: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Preprocess and predict
        X, metadata = inference_engine.preprocess_prediction_input(request_dict)
        lap_time, confidence = inference_engine.predict_lap_time(X)
        
        # Generate explanation - with detailed logging
        features_dict = {k: v for k, v in request_dict.items() 
                        if k in NUMERIC_FEATURES}
        
        logger.info(f"ExplainAI available: {explain_ai.is_available()}")
        logger.info(f"Features for explanation: {list(features_dict.keys())}")
        logger.info(f"Prediction value: {lap_time}")
        
        explanation = explain_ai.explain_prediction(
            features=features_dict,
            prediction=lap_time,
            task="lap_time"
        )
        
        logger.info(f"Generated explanation: {explanation[:100]}...")
        
        response = LapTimeResponse(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            lap=request.lap,
            predicted_lap_time=lap_time,
            confidence=confidence,
            explanation=explanation
        )
        
        # Store prediction in session
        sessions[request.session_id]['predictions'].append({
            'type': 'lap_time',
            'timestamp': datetime.utcnow(),
            'result': response.model_dump()
        })
        
        logger.info(f"Lap time prediction for session {request.session_id}: {lap_time:.2f}s")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting lap time: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/predict/pit", response_model=PitImminentResponse)
async def predict_pit(request: PredictionRequest) -> PitImminentResponse:
    """
    Predict if pit stop is imminent with explanation.
    """
    try:
        if request.session_id not in sessions:
            logger.warning(f"Invalid session: {request.session_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {request.session_id} not found"
            )
        
        request_dict = request.model_dump()
        is_valid, error_msg = validate_input_data(request_dict, NUMERIC_FEATURES)
        if not is_valid:
            logger.warning(f"Invalid input: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        X, metadata = inference_engine.preprocess_prediction_input(request_dict)
        pit_imminent, probability = inference_engine.predict_pit_imminent(X)
        
        features_dict = {k: v for k, v in request_dict.items() if k in NUMERIC_FEATURES}
        
        logger.info(f"ExplainAI available: {explain_ai.is_available()}")
        logger.info(f"Pit prediction: {pit_imminent}")
        
        explanation = explain_ai.explain_prediction(
            features=features_dict,
            prediction=pit_imminent,
            task="pit_detection"
        )
        
        logger.info(f"Generated explanation: {explanation[:100]}...")
        
        response = PitImminentResponse(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            lap=request.lap,
            pit_imminent=pit_imminent,
            probability=probability,
            explanation=explanation
        )
        
        sessions[request.session_id]['predictions'].append({
            'type': 'pit_imminent',
            'timestamp': datetime.utcnow(),
            'result': response.model_dump()
        })
        
        logger.info(f"Pit imminent prediction for session {request.session_id}: {pit_imminent}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting pit: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/predict/tire", response_model=TireCompoundResponse)
async def predict_tire(request: PredictionRequest) -> TireCompoundResponse:
    """
    Predict suggested tire compound with explanation.
    """
    try:
        if request.session_id not in sessions:
            logger.warning(f"Invalid session: {request.session_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {request.session_id} not found"
            )
        
        request_dict = request.model_dump()
        is_valid, error_msg = validate_input_data(request_dict, NUMERIC_FEATURES)
        if not is_valid:
            logger.warning(f"Invalid input: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        X, metadata = inference_engine.preprocess_prediction_input(request_dict)
        tire_compound, confidence = inference_engine.predict_tire_compound(X)
        
        features_dict = {k: v for k, v in request_dict.items() if k in NUMERIC_FEATURES}
        
        logger.info(f"ExplainAI available: {explain_ai.is_available()}")
        logger.info(f"Tire prediction: {tire_compound}")
        
        explanation = explain_ai.explain_prediction(
            features=features_dict,
            prediction=tire_compound,
            task="tire_suggestion"
        )
        
        logger.info(f"Generated explanation: {explanation[:100]}...")
        
        response = TireCompoundResponse(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            lap=request.lap,
            suggested_compound=tire_compound,
            confidence=confidence,
            explanation=explanation
        )
        
        sessions[request.session_id]['predictions'].append({
            'type': 'tire_compound',
            'timestamp': datetime.utcnow(),
            'result': response.model_dump()
        })
        
        logger.info(f"Tire compound prediction for session {request.session_id}: {tire_compound}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting tire: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/predict/all", response_model=AllPredictionsResponse)
async def predict_all(request: PredictionRequest) -> AllPredictionsResponse:
    """
    Make all predictions at once.
    
    Args:
        request: PredictionRequest with telemetry data
    
    Returns:
        AllPredictionsResponse with all predictions
    """
    try:
        # Validate session
        if request.session_id not in sessions:
            logger.warning(f"Invalid session: {request.session_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {request.session_id} not found"
            )
        
        # Validate input
        request_dict = request.model_dump()
        is_valid, error_msg = validate_input_data(request_dict, NUMERIC_FEATURES)
        if not is_valid:
            logger.warning(f"Invalid input: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Preprocess
        X, metadata = inference_engine.preprocess_prediction_input(request_dict)
        
        # Make all predictions
        predictions = inference_engine.predict_all(X)
        
        response = AllPredictionsResponse(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            lap=request.lap,
            lap_time=predictions['lap_time'],
            lap_time_confidence=predictions['lap_time_confidence'],
            pit_imminent=predictions['pit_imminent'],
            pit_probability=predictions['pit_probability'],
            tire_compound=predictions['tire_compound'],
            tire_confidence=predictions['tire_confidence']
        )
        
        # Store prediction in session
        sessions[request.session_id]['predictions'].append({
            'type': 'all',
            'timestamp': datetime.utcnow(),
            'result': response.model_dump()
        })
        
        logger.info(f"All predictions for session {request.session_id} completed")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error making all predictions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/session/{session_id}/predictions")
async def get_session_predictions(session_id: str):
    """
    Get all predictions for a session.
    
    Args:
        session_id: Session identifier
    
    Returns:
        List of predictions for the session
    """
    if session_id not in sessions:
        logger.warning(f"Session not found: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    predictions = sessions[session_id]['predictions']
    logger.info(f"Retrieved {len(predictions)} predictions for session {session_id}")
    
    return {
        'session_id': session_id,
        'prediction_count': len(predictions),
        'predictions': predictions
    }


@router.post("/session/{session_id}/close", response_model=SessionResponse)
async def close_session(session_id: str) -> SessionResponse:
    """
    Close a session.
    
    Args:
        session_id: Session identifier
    
    Returns:
        Updated SessionResponse with status='closed'
    """
    if session_id not in sessions:
        logger.warning(f"Session not found: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    session = sessions[session_id]
    session['status'] = 'closed'
    
    logger.info(f"Closed session {session_id}")
    
    return SessionResponse(
        session_id=session['session_id'],
        vehicle_id=session['vehicle_id'],
        race_name=session['race_name'],
        created_at=session['created_at'],
        status='closed'
    )

@router.post("/race/generate-race-story-auto")
async def generate_race_story_auto(request: RaceStoryRequestAuto):

    # 1. Get stored predictions
    if request.session_id not in sessions:
        raise HTTPException(
            status_code=404,
            detail=f"Session {request.session_id} not found"
        )

    session_predictions = sessions[request.session_id]["predictions"]

    # 2. Extract race events
    race_events = extract_race_events(session_predictions)

    # 3. Generate summary statistics
    summary_stats = calculate_summary_stats(
        session_data={"session_id": request.session_id},
        session_predictions=session_predictions
    )

    # 4. Ask Gemini to create the story
    story = race_story_generator.generate_story(
        session_id=request.session_id,
        vehicle_id=request.vehicle_id,
        race_events=race_events,
        summary_stats=summary_stats
    )

    return {
        "session_id": request.session_id,
        "vehicle_id": request.vehicle_id,
        "story": story
    }

@router.post("/race/story", response_model=RaceStoryResponse)
async def generate_race_story(request: RaceStoryRequest) -> RaceStoryResponse:
    """
    Generate a post-race narrative story for a specific vehicle.
    
    Args:
        request: RaceStoryRequest with session info, race events, and summary statistics
    
    Returns:
        RaceStoryResponse with the AI-generated race story
    """
    try:
        # Validate session exists
        if request.session_id not in sessions:
            logger.warning(f"Invalid session: {request.session_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {request.session_id} not found"
            )
        
        # Log request details
        logger.info(f"Generating race story for session {request.session_id}, vehicle {request.vehicle_id}")
        logger.info(f"Race events: {len(request.race_events)} events")
        logger.info(f"RaceStoryGenerator available: {race_story_generator.is_available()}")
        
        # Convert race_events to proper format
        race_events = [event.model_dump() if hasattr(event, 'model_dump') else event 
                      for event in request.race_events]
        
        # Generate the story
        story = race_story_generator.generate_story(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            race_events=race_events,
            summary_stats=request.summary_stats
        )
        
        logger.info(f"Successfully generated story. Length: {len(story)} characters")
        logger.debug(f"Story preview: {story[:150]}...")
        
        response = RaceStoryResponse(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            story=story
        )
        
        # Store story in session
        sessions[request.session_id]['race_story'] = {
            'vehicle_id': request.vehicle_id,
            'story': story,
            'generated_at': datetime.utcnow(),
            'race_events_count': len(race_events)
        }
        
        logger.info(f"Race story stored in session {request.session_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating race story: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Race story generation failed: {str(e)}"
        )


