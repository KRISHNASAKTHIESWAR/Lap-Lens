import { useState, useCallback } from 'react';
import { PredictionRequest, AllPredictionsResponse } from '../lib/types';
import { api } from '../lib/api';

export function usePredictions() {
  const [predictions, setPredictions] = useState<AllPredictionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllPredictions = useCallback(async (data: PredictionRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getAllPredictions(data);
      setPredictions(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get predictions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSessionPredictions = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getSessionPredictions(sessionId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get session predictions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    clearPredictions,
  };
}