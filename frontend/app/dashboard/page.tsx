'use client';

import { useState } from 'react';
import Header from '../components/layout/Header';
import VehicleInput from '../components/dashboard/VehicleInput';
import TelemetryCharts from '../components/dashboard/TelemetryCharts';
import PredictionMetrics from '../components/dashboard/PredictionMetrics';
import SessionInfo from '../components/dashboard/SessionInfo';
import LiveMetrics from '../components/dashboard/LiveMetrics';
import { api } from '../lib/api';
import { Session, AllPredictionsResponse, PredictionRequest } from '../lib/types';

export default function Dashboard() {
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentPredictions, setCurrentPredictions] = useState<AllPredictionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVehicleSelect = async (vehicleId: number) => {
    setIsLoading(true);
    setError(null);
    setSelectedVehicle(vehicleId);
    
    try {
      // STEP 1: Create a session for this vehicle - REAL API CALL
      const session = await api.createSession(vehicleId, "Race 1");
      setCurrentSession(session);
      
      // STEP 2: Prepare prediction request with session data
      const predictionRequest: PredictionRequest = {
        session_id: session.session_id,
        vehicle_id: vehicleId,
        lap: 1, // Starting lap
        // These will be your ACTUAL telemetry values from the car
        max_speed: 0,
        avg_speed: 0,
        std_speed: 0,
        avg_throttle: 0,
        brake_front_freq: 0,
        brake_rear_freq: 0,
        dominant_gear: 0,
        avg_steer_angle: 0,
        avg_long_accel: 0,
        avg_lat_accel: 0,
        avg_rpm: 0,
        rolling_std_lap_time: 0,
        lap_time_delta: 0,
        tire_wear_high: 0,
        air_temp: 0,
        track_temp: 0,
        humidity: 0,
        pressure: 0,
        wind_speed: 0,
        wind_direction: 0,
        rain: 0
      };

      // STEP 3: Get REAL predictions from your ML model
      const predictions = await api.getAllPredictions(predictionRequest);
      setCurrentPredictions(predictions);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get predictions. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Vehicle Input */}
        <div className="mb-8">
          <VehicleInput 
            onVehicleSelect={handleVehicleSelect}
            isLoading={isLoading}
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">Error: {error}</span>
            </div>
          </div>
        )}

        {selectedVehicle && currentSession && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Session Info */}
            <div className="lg:col-span-1 space-y-6">
              <SessionInfo 
                session={currentSession}
                predictions={currentPredictions}
              />
            </div>

            {/* Charts and Metrics */}
            <div className="lg:col-span-2 space-y-6">
              {currentPredictions && (
                <>
                  <PredictionMetrics predictions={currentPredictions} />
                  <TelemetryCharts 
                    vehicleId={selectedVehicle}
                    predictions={currentPredictions}
                  />
                  <LiveMetrics 
                    vehicleId={selectedVehicle}
                    predictions={currentPredictions}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {!selectedVehicle && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏎️</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              Enter Vehicle Number
            </h3>
            <p className="text-gray-500">
              Enter a vehicle number to start real-time telemetry analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}