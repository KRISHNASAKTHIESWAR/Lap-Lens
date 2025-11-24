import { useState, useEffect, useCallback } from 'react';
import { Session, PredictionRequest, AllPredictionsResponse } from '../lib/types';
import { api } from '../lib/api';

export function useSession(sessionId?: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local storage keys
  const SESSION_STORAGE_KEY = 'f1_analytics_sessions';
  const PREDICTIONS_STORAGE_KEY = 'f1_analytics_predictions';

  // Helper functions for local storage
  const getStoredSessions = useCallback((): Record<string, Session> => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const getStoredPredictions = useCallback((): Record<string, AllPredictionsResponse[]> => {
    try {
      const stored = localStorage.getItem(PREDICTIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const storeSession = useCallback((sessionData: Session) => {
    try {
      const sessions = getStoredSessions();
      sessions[sessionData.session_id] = sessionData;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to store session locally:', error);
    }
  }, [getStoredSessions]);

  const storePrediction = useCallback((sessionId: string, prediction: AllPredictionsResponse) => {
    try {
      const predictions = getStoredPredictions();
      if (!predictions[sessionId]) {
        predictions[sessionId] = [];
      }
      predictions[sessionId].push(prediction);
      localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(predictions));
    } catch (error) {
      console.warn('Failed to store prediction locally:', error);
    }
  }, [getStoredPredictions]);

  const getStoredSessionPredictions = useCallback((sessionId: string): AllPredictionsResponse[] => {
    try {
      const predictions = getStoredPredictions();
      return predictions[sessionId] || [];
    } catch {
      return [];
    }
  }, [getStoredPredictions]);

  const createSession = async (vehicleId: number, raceName: string = "Race 1") => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await api.createSession(vehicleId, raceName);
      setSession(newSession);
      storeSession(newSession);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSession = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to get from API first
      const sessionData = await api.getSession(id);
      setSession(sessionData);
      storeSession(sessionData);
      return sessionData;
    } catch (err) {
      // Fallback to local storage if API fails
      console.warn('API fetch failed, trying local storage...');
      const sessions = getStoredSessions();
      const localSession = sessions[id];
      if (localSession) {
        setSession(localSession);
        return localSession;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const closeSession = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const closedSession = await api.closeSession(id);
      
      // Enhance closed session with local predictions before storing
      const enhancedSession = {
        ...closedSession,
        localPredictions: getStoredSessionPredictions(id),
        closedAt: new Date().toISOString()
      };
      
      setSession(enhancedSession);
      storeSession(enhancedSession);
      return enhancedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced prediction function that stores locally
  const makePrediction = async (predictionData: PredictionRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getAllPredictions(predictionData);
      
      // Store prediction locally
      storePrediction(predictionData.session_id, result);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make prediction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get complete session history including local predictions
  const getSessionHistory = useCallback((sessionId: string) => {
    const session = getStoredSessions()[sessionId];
    const predictions = getStoredSessionPredictions(sessionId);
    
    return {
      session,
      predictions,
      hasLocalData: predictions.length > 0
    };
  }, [getStoredSessions, getStoredSessionPredictions]);

  // Clear local storage (optional, for cleanup)
  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(PREDICTIONS_STORAGE_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId]);

  return {
    session,
    isLoading,
    error,
    createSession,
    fetchSession,
    closeSession,
    makePrediction,
    getSessionHistory,
    clearLocalStorage,
  };
}