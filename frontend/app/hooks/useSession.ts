import { useState, useEffect } from 'react';
import { Session } from '../lib/types';
import { api } from '../lib/api';

export function useSession(sessionId?: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async (vehicleId: number, raceName: string = "Race 1") => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await api.createSession(vehicleId, raceName);
      setSession(newSession);
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
      const sessionData = await api.getSession(id);
      setSession(sessionData);
      return sessionData;
    } catch (err) {
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
      setSession(closedSession);
      return closedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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
  };
}