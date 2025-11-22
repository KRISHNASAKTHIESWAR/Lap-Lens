import { 
  Session, 
  PredictionRequest, 
  AllPredictionsResponse 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  // Session management
  createSession: async (vehicleId: number, raceName: string = "Race 1"): Promise<Session> => {
    const response = await fetch(`http://localhost:8000/api/session/create?vehicle_id=${vehicleId}&race_name=${encodeURIComponent(raceName)}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to create session');
    return response.json();
  },

  getSession: async (sessionId: string): Promise<Session> => {
    const response = await fetch(`http://localhost:8000/api/session/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch session');
    return response.json();
  },

  closeSession: async (sessionId: string): Promise<Session> => {
    const response = await fetch(`http://localhost:8000/api/session/${sessionId}/close`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to close session');
    return response.json();
  },

  // Predictions
  getAllPredictions: async (data: PredictionRequest): Promise<AllPredictionsResponse> => {
    const response = await fetch(`http://localhost:8000/api/predict/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to get predictions');
    return response.json();
  },

  getSessionPredictions: async (sessionId: string): Promise<any[]> => {
    const response = await fetch(`http://localhost:8000/api/session/${sessionId}/predictions`);
    if (!response.ok) throw new Error('Failed to fetch session predictions');
    return response.json();
  },
};