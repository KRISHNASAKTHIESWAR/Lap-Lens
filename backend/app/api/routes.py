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
    TireCompoundResponse, AllPredictionsResponse
)
from app.schemas.session import SessionResponse, SessionErrorResponse
from app.services.inference import InferenceEngine
from app.utils.preprocess import validate_input_data
from app.core.config import NUMERIC_FEATURES

logger = logging.getLogger(__name__)

router = APIRouter()

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
    Predict lap time.
    
    Args:
        request: PredictionRequest with telemetry data
    
    Returns:
        LapTimeResponse with prediction and confidence
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
        
        response = LapTimeResponse(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            lap=request.lap,
            predicted_lap_time=lap_time,
            confidence=confidence
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
        logger.error(f"Error predicting lap time: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/predict/pit", response_model=PitImminentResponse)
async def predict_pit(request: PredictionRequest) -> PitImminentResponse:
    """
    Predict if pit stop is imminent.
    
    Args:
        request: PredictionRequest with telemetry data
    
    Returns:
        PitImminentResponse with prediction and probability
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
        pit_imminent, probability = inference_engine.predict_pit_imminent(X)
        
        response = PitImminentResponse(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            lap=request.lap,
            pit_imminent=pit_imminent,
            probability=probability
        )
        
        # Store prediction in session
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
        logger.error(f"Error predicting pit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/predict/tire", response_model=TireCompoundResponse)
async def predict_tire(request: PredictionRequest) -> TireCompoundResponse:
    """
    Predict suggested tire compound.
    
    Args:
        request: PredictionRequest with telemetry data
    
    Returns:
        TireCompoundResponse with suggestion and confidence
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
        tire_compound, confidence = inference_engine.predict_tire_compound(X)
        
        response = TireCompoundResponse(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            lap=request.lap,
            suggested_compound=tire_compound,
            confidence=confidence
        )
        
        # Store prediction in session
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
        logger.error(f"Error predicting tire: {e}")
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
