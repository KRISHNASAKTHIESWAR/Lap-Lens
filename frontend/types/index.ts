export interface Player {
  id: number;
  name: string;
  driver: string;
  position: number;
  lapTime: string;
  tireCompound: string;
  fuel: number;
  pitLaps: number;
  status: 'Racing' | 'Pitting' | 'Retired';
}

export interface TelemetryData {
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  tire_temp: number;
  fuel_level: number;
  lap_time: number;
  lap?: number;
  session_id?: string;
  vehicle_id?: number;
}

export interface PredictionData {
  lapTime: {
    predicted: string;
    confidence: number;
  };
  pitImminent: {
    predicted: boolean;
    probability: number;
  };
  tireCompound: {
    suggested: string;
    confidence: number;
  };
}

export interface AIInsight {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

export interface SessionData {
  session_id: string;
  vehicle_id: number;
  race_name: string;
  created_at: string;
  status: 'active' | 'closed';
}

export interface LapTimeResponse {
  session_id: string;
  vehicle_id: number;
  lap: number;
  predicted_lap_time: number;
  confidence: number;
}

export interface PitImminentResponse {
  session_id: string;
  vehicle_id: number;
  lap: number;
  pit_imminent: boolean;
  probability: number;
}

export interface TireCompoundResponse {
  session_id: string;
  vehicle_id: number;
  lap: number;
  suggested_compound: string;
  confidence: number;
}

export interface AllPredictionsResponse {
  session_id: string;
  vehicle_id: number;
  lap: number;
  lap_time: number;
  lap_time_confidence: number;
  pit_imminent: boolean;
  pit_probability: number;
  tire_compound: string;
  tire_confidence: number;
}

export interface PredictionRequest {
  session_id: string;
  vehicle_id: number;
  lap: number;
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  tire_temp: number;
  fuel_level: number;
  lap_time: number;
}