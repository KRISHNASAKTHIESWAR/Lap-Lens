export interface Session {
  session_id: string;
  vehicle_id: number;
  race_name: string;
  created_at: string;
  status: string;
}

export interface PredictionRequest {
  session_id: string;
  vehicle_id: number;
  lap: number;
  max_speed: number;
  avg_speed: number;
  std_speed: number;
  avg_throttle: number;
  brake_front_freq: number;
  brake_rear_freq: number;
  dominant_gear: number;
  avg_steer_angle: number;
  avg_long_accel: number;
  avg_lat_accel: number;
  avg_rpm: number;
  rolling_std_lap_time: number;
  lap_time_delta: number;
  tire_wear_high: number;
  air_temp: number;
  track_temp: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  rain: number;
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

// lib/types.ts
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