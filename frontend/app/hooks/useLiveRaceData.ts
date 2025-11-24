'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LiveRaceData {
  lap: number;
  lap_time: number;
  lap_time_confidence: number;
  pit_imminent: boolean;
  pit_probability: number;
  tire_compound: string;
  tire_confidence: number;
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

export const useLiveRaceData = (initialData: Partial<LiveRaceData> = {}, refreshInterval = 3000, isSessionActive = true) => {
  const [liveData, setLiveData] = useState<LiveRaceData>(() => ({
    lap: 1,
    lap_time: 85.234,
    lap_time_confidence: 0.87,
    pit_imminent: false,
    pit_probability: 0.23,
    tire_compound: 'SOFT',
    tire_confidence: 0.91,
    max_speed: 285,
    avg_speed: 195,
    std_speed: 8,
    avg_throttle: 65,
    brake_front_freq: 1.2,
    brake_rear_freq: 0.8,
    dominant_gear: 4,
    avg_steer_angle: 5,
    avg_long_accel: 1.2,
    avg_lat_accel: 2.1,
    avg_rpm: 9500,
    rolling_std_lap_time: 1.2,
    lap_time_delta: -0.5,
    tire_wear_high: 25,
    air_temp: 22,
    track_temp: 28,
    humidity: 45,
    pressure: 1013,
    wind_speed: 3,
    wind_direction: 180,
    rain: 0,
    ...initialData
  }));

  const generateNextData = useCallback((current: LiveRaceData): LiveRaceData => {
    const randomVariation = (base: number, range: number) => base + (Math.random() - 0.5) * range;
    const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    // Only increment lap if session is active
    const shouldIncrementLap = isSessionActive && Math.random() > 0.7;
    
    return {
      ...current,
      lap: shouldIncrementLap ? current.lap + 1 : current.lap,
      lap_time: randomVariation(current.lap_time, 0.8),
      lap_time_confidence: Math.min(0.98, Math.max(0.75, randomVariation(current.lap_time_confidence, 0.1))),
      pit_imminent: current.pit_probability > 0.8 || Math.random() > 0.9,
      pit_probability: Math.min(0.95, Math.max(0.05, randomVariation(current.pit_probability, 0.15))),
      tire_compound: randomChoice(['SOFT', 'MEDIUM', 'HARD']),
      tire_confidence: Math.min(0.98, Math.max(0.8, randomVariation(current.tire_confidence, 0.1))),
      max_speed: randomVariation(current.max_speed, 8),
      avg_speed: randomVariation(current.avg_speed, 12),
      std_speed: randomVariation(current.std_speed, 2),
      avg_throttle: randomVariation(current.avg_throttle, 8),
      brake_front_freq: randomVariation(current.brake_front_freq, 0.4),
      brake_rear_freq: randomVariation(current.brake_rear_freq, 0.3),
      dominant_gear: Math.min(8, Math.max(1, Math.round(randomVariation(current.dominant_gear, 1)))),
      avg_steer_angle: randomVariation(current.avg_steer_angle, 1.5),
      avg_long_accel: randomVariation(current.avg_long_accel, 0.3),
      avg_lat_accel: randomVariation(current.avg_lat_accel, 0.5),
      avg_rpm: randomVariation(current.avg_rpm, 400),
      rolling_std_lap_time: randomVariation(current.rolling_std_lap_time, 0.2),
      lap_time_delta: randomVariation(current.lap_time_delta, 0.6),
      tire_wear_high: Math.min(80, Math.max(5, current.tire_wear_high + (Math.random() * 2))),
      air_temp: randomVariation(current.air_temp, 2),
      track_temp: randomVariation(current.track_temp, 3),
      humidity: randomVariation(current.humidity, 10),
      pressure: randomVariation(current.pressure, 5),
      wind_speed: randomVariation(current.wind_speed, 2),
      wind_direction: randomVariation(current.wind_direction, 30),
      rain: Math.random() > 0.95 ? Math.random() * 0.3 : 0,
    };
  }, [isSessionActive]);

  useEffect(() => {
    if (!isSessionActive) return; // Stop updates when session is closed

    const interval = setInterval(() => {
      setLiveData(current => generateNextData(current));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [generateNextData, refreshInterval, isSessionActive]);

  return liveData;
};