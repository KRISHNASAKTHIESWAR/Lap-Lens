import { useState, useCallback } from 'react';
import { PredictionRequest, AllPredictionsResponse } from '../lib/types';
import { api } from '../lib/api';

export function usePredictions() {
  const [predictions, setPredictions] = useState<AllPredictionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local storage for predictions history and current compounds
  const PREDICTIONS_HISTORY_KEY = 'predictions_history';
  const CURRENT_COMPOUNDS_KEY = 'current_compounds';

  const getStoredPredictionsHistory = useCallback((): Record<string, AllPredictionsResponse[]> => {
    try {
      const stored = localStorage.getItem(PREDICTIONS_HISTORY_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const getStoredCurrentCompounds = useCallback((): Record<string, string> => {
    try {
      const stored = localStorage.getItem(CURRENT_COMPOUNDS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const updateCurrentCompound = useCallback((sessionId: string, compound: string, forceUpdate = false) => {
    try {
      const compounds = getStoredCurrentCompounds();
      // Only update if it's a new session OR we're forcing an update (for pit stops)
      if (!compounds[sessionId] || forceUpdate) {
        compounds[sessionId] = compound;
        localStorage.setItem(CURRENT_COMPOUNDS_KEY, JSON.stringify(compounds));
      }
    } catch (error) {
      console.warn('Failed to store current compound:', error);
    }
  }, [getStoredCurrentCompounds]);

  const storePredictionInHistory = useCallback((sessionId: string, prediction: AllPredictionsResponse) => {
    try {
      const history = getStoredPredictionsHistory();
      if (!history[sessionId]) {
        history[sessionId] = [];
      }
      
      // Check if prediction for this lap already exists
      const existingIndex = history[sessionId].findIndex(p => p.lap === prediction.lap);
      if (existingIndex >= 0) {
        history[sessionId][existingIndex] = prediction; // Update existing
      } else {
        history[sessionId].push(prediction); // Add new
      }
      
      localStorage.setItem(PREDICTIONS_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to store prediction in history:', error);
    }
  }, [getStoredPredictionsHistory]);

  const getAllPredictions = useCallback(async (data: PredictionRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getAllPredictions(data);
      
      // Get current stored compound
      const compounds = getStoredCurrentCompounds();
      const currentCompound = compounds[data.session_id];
      
      // If this is a new session OR pit is imminent, update the compound
      if (!currentCompound || result.pit_imminent) {
        updateCurrentCompound(data.session_id, result.tire_compound, result.pit_imminent);
      }

      setPredictions(result);
      
      // Store in local history
      storePredictionInHistory(data.session_id, result);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get predictions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storePredictionInHistory, updateCurrentCompound, getStoredCurrentCompounds]);

  const getSessionPredictions = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Try API first
      const result = await api.getSessionPredictions(sessionId);
      return result;
    } catch (err) {
      // Fallback to local storage
      console.warn('API failed, using local predictions history');
      const history = getStoredPredictionsHistory();
      const localPredictions = history[sessionId] || [];
      
      if (localPredictions.length > 0) {
        return localPredictions;
      }
      
      setError(err instanceof Error ? err.message : 'Failed to get session predictions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getStoredPredictionsHistory]);

  const getSessionPredictionsHistory = useCallback((sessionId: string): AllPredictionsResponse[] => {
    const history = getStoredPredictionsHistory();
    return history[sessionId] || [];
  }, [getStoredPredictionsHistory]);

  const getCurrentCompound = useCallback((sessionId: string): string | null => {
    const compounds = getStoredCurrentCompounds();
    return compounds[sessionId] || null;
  }, [getStoredCurrentCompounds]);

  const clearPredictions = useCallback(() => {
    setPredictions(null);
    setError(null);
  }, []);

  return {
    predictions,
    isLoading,
    error,
    getAllPredictions,
    getSessionPredictions,
    getSessionPredictionsHistory,
    getCurrentCompound,
    clearPredictions,
  };
}