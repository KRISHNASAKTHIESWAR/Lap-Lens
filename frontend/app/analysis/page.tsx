"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import ControlPanel from '../components/dashboard/ControlPanel';
import TelemetryCharts from '../components/dashboard/TelemetryCharts';
import PredictionMetrics from '../components/dashboard/PredictionMetrics';
import SessionInfo from '../components/dashboard/SessionInfo';
import LiveMetrics from '../components/dashboard/LiveMetrics';
import TrackMap from '../components/dashboard/TrackMap';
import StoryGenerator from '../components/dashboard/StoryGenerator';
import { useLiveRaceData } from '../hooks/useLiveRaceData';
import { usePredictions } from '../hooks/usePredictions';
import { PredictionRequest } from '../lib/types';

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
  explanations?: {
    lap_time?: string;
    pit?: string;  
    tire?: string;
  };
  lap_time_explanation?: string;
  pit_explanation?: string;
  tire_explanation?: string;
}

const safeNumber = (value: any, fallback: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

type ActiveView = 'overview' | 'telemetry' | 'predictions' | 'track' | 'metrics';

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const vehicleId = searchParams.get('vehicle_id');

  const [predictions, setPredictions] = useState<AllPredictionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [showStoryGenerator, setShowStoryGenerator] = useState(false);
  const [currentLap, setCurrentLap] = useState(1);
  const [finalLap, setFinalLap] = useState(1);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [lastExplanationUpdate, setLastExplanationUpdate] = useState(0);

  // Use live data hook - stops completely when session is not active
  const liveData = useLiveRaceData({}, 3000, isSessionActive);
  
  // Use predictions hook for consistent tire compound storage
  const { getAllPredictions, getCurrentCompound } = usePredictions();

  // Track lap progression - ONLY when session is active
  useEffect(() => {
    if (isSessionActive && liveData.lap > currentLap) {
      setCurrentLap(liveData.lap);
    }
  }, [liveData.lap, currentLap, isSessionActive]);

  // Initial data fetch from backend
  useEffect(() => {
    if (sessionId && vehicleId) {
      fetchPredictions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, vehicleId]);

  // Update predictions with live data AND fetch new AI explanations every 10 seconds
  useEffect(() => {
    if (predictions && isSessionActive) {
      const now = Date.now();
      
      // Get the stored compound to maintain consistency
      const storedCompound = getCurrentCompound(sessionId!);
      
      // Update numeric values immediately
      setPredictions(prev => prev ? {
        ...prev,
        lap: liveData.lap,
        lap_time: liveData.lap_time,
        lap_time_confidence: liveData.lap_time_confidence,
        pit_imminent: liveData.pit_imminent,
        pit_probability: liveData.pit_probability,
        tire_compound: storedCompound || liveData.tire_compound, // Use stored compound
        tire_confidence: liveData.tire_confidence,
      } : null);

      // Fetch new AI explanations every 10 seconds with current data
      if (now - lastExplanationUpdate > 10000) { // 10 seconds
        fetchAIExplanations();
        setLastExplanationUpdate(now);
      }
    }
  }, [liveData, isSessionActive, sessionId, getCurrentCompound]);

  // STOP ALL UPDATES when session closes
  const handleSessionClose = async () => {
    setIsSessionActive(false); // This stops useLiveRaceData hook
    setFinalLap(currentLap); // Capture the final lap
    
    try {
      // Actually close the session in backend
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session/${sessionId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log(`Session closed at lap ${currentLap}`);
    } catch (err) {
      console.error('Error closing session in backend:', err);
    }
    
    setShowStoryGenerator(true);
  };

  // Fetch AI explanations with current live data every 10 seconds
  const fetchAIExplanations = async () => {
    if (!sessionId || !vehicleId || !isSessionActive) return;

    try {
      const vehicleNum = parseInt(vehicleId);
      
      // Prepare current live data for backend
      const currentData: PredictionRequest = {
        session_id: sessionId,
        vehicle_id: vehicleNum,
        lap: liveData.lap,
        max_speed: liveData.max_speed,
        avg_speed: liveData.avg_speed,
        std_speed: liveData.std_speed,
        avg_throttle: liveData.avg_throttle,
        brake_front_freq: liveData.brake_front_freq,
        brake_rear_freq: liveData.brake_rear_freq,
        dominant_gear: liveData.dominant_gear,
        avg_steer_angle: liveData.avg_steer_angle,
        avg_long_accel: liveData.avg_long_accel,
        avg_lat_accel: liveData.avg_lat_accel,
        avg_rpm: liveData.avg_rpm,
        rolling_std_lap_time: liveData.rolling_std_lap_time,
        lap_time_delta: liveData.lap_time_delta,
        tire_wear_high: liveData.tire_wear_high,
        air_temp: liveData.air_temp,
        track_temp: liveData.track_temp,
        humidity: liveData.humidity,
        pressure: liveData.pressure,
        wind_speed: liveData.wind_speed,
        wind_direction: liveData.wind_direction,
        rain: liveData.rain
      };

      // Call all three prediction endpoints with current data
      const [lapTimeRes, pitRes, tireRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/predict/lap-time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentData)
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/predict/pit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentData)
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/predict/tire`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentData)
        })
      ]);

      if (lapTimeRes.ok && pitRes.ok && tireRes.ok) {
        const [lapTimeData, pitData, tireData] = await Promise.all([
          lapTimeRes.json(),
          pitRes.json(),
          tireRes.json()
        ]);

        // Update predictions with new AI explanations
        setPredictions(prev => prev ? {
          ...prev,
          lap_time_explanation: lapTimeData.explanation,
          pit_explanation: pitData.explanation,
          tire_explanation: tireData.explanation,
          explanations: {
            lap_time: lapTimeData.explanation,
            pit: pitData.explanation,
            tire: tireData.explanation
          }
        } : null);
        
        console.log('AI explanations updated at lap:', liveData.lap);
      }
    } catch (err) {
      console.error('Error fetching AI explanations:', err);
    }
  };

  const fetchPredictions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const vehicleNum = parseInt(vehicleId!);

      const predictionData: PredictionRequest = {
        session_id: sessionId!,
        vehicle_id: vehicleNum,
        lap: currentLap,
        max_speed: liveData.max_speed,
        avg_speed: liveData.avg_speed,
        std_speed: liveData.std_speed,
        avg_throttle: liveData.avg_throttle,
        brake_front_freq: liveData.brake_front_freq,
        brake_rear_freq: liveData.brake_rear_freq,
        dominant_gear: liveData.dominant_gear,
        avg_steer_angle: liveData.avg_steer_angle,
        avg_long_accel: liveData.avg_long_accel,
        avg_lat_accel: liveData.avg_lat_accel,
        avg_rpm: liveData.avg_rpm,
        rolling_std_lap_time: liveData.rolling_std_lap_time,
        lap_time_delta: liveData.lap_time_delta,
        tire_wear_high: liveData.tire_wear_high,
        air_temp: liveData.air_temp,
        track_temp: liveData.track_temp,
        humidity: liveData.humidity,
        pressure: liveData.pressure,
        wind_speed: liveData.wind_speed,
        wind_direction: liveData.wind_direction,
        rain: liveData.rain
      };

      // Use the predictions hook which handles compound storage
      const result = await getAllPredictions(predictionData);
      
      // Get the stored compound to ensure consistency
      const storedCompound = getCurrentCompound(sessionId!);

      const allPredictions: AllPredictionsResponse = {
        session_id: sessionId!,
        vehicle_id: vehicleNum,
        lap: currentLap,
        lap_time: safeNumber(result.lap_time, liveData.lap_time),
        lap_time_confidence: safeNumber(result.lap_time_confidence, liveData.lap_time_confidence),
        pit_imminent: result.pit_imminent || liveData.pit_imminent,
        pit_probability: safeNumber(result.pit_probability, liveData.pit_probability),
        tire_compound: storedCompound || result.tire_compound, // Use stored compound
        tire_confidence: safeNumber(result.tire_confidence, liveData.tire_confidence),
        lap_time_explanation: result.lap_time_explanation,
        pit_explanation: result.pit_explanation,
        tire_explanation: result.tire_explanation,
        explanations: {
          lap_time: result.lap_time_explanation,
          pit: result.pit_explanation,
          tire: result.tire_explanation
        }
      };

      setPredictions(allPredictions);
      setLastExplanationUpdate(Date.now());

    } catch (err) {
      console.error('Error:', err);
      setError('Using live data - Backend connection failed');
      
      // Use live data with fallback explanations
      const storedCompound = getCurrentCompound(sessionId!);
      
      const fallbackPredictions: AllPredictionsResponse = {
        session_id: sessionId!,
        vehicle_id: parseInt(vehicleId!),
        lap: liveData.lap,
        lap_time: liveData.lap_time,
        lap_time_confidence: liveData.lap_time_confidence,
        pit_imminent: liveData.pit_imminent,
        pit_probability: liveData.pit_probability,
        tire_compound: storedCompound || liveData.tire_compound, // Use stored compound
        tire_confidence: liveData.tire_confidence,
        lap_time_explanation: `Live Analysis (Lap ${liveData.lap}): Predicted lap time of ${liveData.lap_time.toFixed(3)}s based on current telemetry.`,
        pit_explanation: `Live Analysis (Lap ${liveData.lap}): ${liveData.pit_imminent ? 'Pit stop recommended' : 'Continue current stint'}.`,
        tire_explanation: `Live Analysis (Lap ${liveData.lap}): ${storedCompound || liveData.tire_compound} compound recommended for current conditions.`,
        explanations: {
          lap_time: `Live Analysis (Lap ${liveData.lap}): Predicted lap time of ${liveData.lap_time.toFixed(3)}s based on current telemetry.`,
          pit: `Live Analysis (Lap ${liveData.lap}): ${liveData.pit_imminent ? 'Pit stop recommended' : 'Continue current stint'}.`,
          tire: `Live Analysis (Lap ${liveData.lap}): ${storedCompound || liveData.tire_compound} compound recommended for current conditions.`
        }
      };
      
      setPredictions(fallbackPredictions);
    } finally {
      setIsLoading(false);
    }
  };

  // Toyota theme colors
  const TOYOTA = {
    red: 'rgba(206,17,38,1)',
    redTranslucent: 'rgba(206,17,38,0.12)',
    gray: '#0f1724',
    light: '#f8fafc'
  };

  if (!sessionId || !vehicleId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-2xl text-white font-bold mb-2">Invalid Session</h2>
          <p className="text-gray-400">Please select a vehicle first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative" style={{background: `linear-gradient(180deg, ${TOYOTA.gray} 0%, #000 60%)`}}>
      {/* Decorative overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(206,17,38,0.18),transparent_30%)] blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.02),transparent_40%)] blur-2xl" />
        <div className="absolute inset-0 bg-[url('https://i.imgur.com/8yTCYvA.png')] bg-[length:600px_600px] opacity-5 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 animate-grid-pan" />
      </div>

      <Header />

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Control Panel */}
        <ControlPanel
          activeView={activeView}
          onViewChange={(v: ActiveView) => setActiveView(v)}
          vehicleId={parseInt(vehicleId!)}
        />

        {/* Live Status Indicator */}
        {!isLoading && isSessionActive && (
          <div className="flex items-center justify-end mb-2">
            <div className="flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full border border-green-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-orbitron">
                LIVE DATA • LAP {currentLap} • AI UPDATING EVERY 10s
              </span>
            </div>
          </div>
        )}

        {/* Session Closed Indicator */}
        {!isSessionActive && (
          <div className="flex items-center justify-end mb-2">
            <div className="flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full border border-red-500/30">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-red-400 font-orbitron">
                SESSION CLOSED • FINAL LAP {finalLap}
              </span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="mt-4 min-h-[600px]">
          {/* Loading state */}
          {isLoading && (
            <div className="min-h-[420px] flex flex-col items-center justify-center">
              <motion.div
                className="w-28 h-28 rounded-full border-8 border-t-transparent border-red-600"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              />

              <h2 className="text-3xl text-white font-bold mt-6 tracking-wider">INITIALIZING SYSTEMS</h2>
              <p className="text-gray-300 mt-2">Vehicle #{vehicleId} • Toyota Gazoo Racing</p>

              <div className="mt-6 flex space-x-1 justify-center">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-8 rounded-sm bg-red-600 animate-rpm" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Loaded views */}
          {!isLoading && predictions && (
            <>
              {/* Overview View */}
              {activeView === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 xl:grid-cols-4 gap-6"
                >
                  
                  {/* Left Column - Main Content */}
                  <div className="xl:col-span-3 space-y-6">
                    {/* Prediction Metrics - Top Card */}
                    <div className="rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/40 to-white/5 shadow-lg">
                      <div className="bg-black/60 rounded-2xl p-6">
                        <PredictionMetrics 
                          predictions={predictions} 
                          sessionId={sessionId}  
                        />
                      </div>
                    </div>

                    {/* Story Generator - Right below predictions */}
                    {showStoryGenerator && (
                      <StoryGenerator
                        sessionId={sessionId!}
                        vehicleId={parseInt(vehicleId!)}
                      />
                    )}

                    {/* Bottom Row Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Live Status Card */}
                      <div className="rounded-xl bg-black/50 p-5 border border-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm text-gray-300 font-orbitron tracking-wider">
                              {isSessionActive ? 'LIVE STATUS' : 'SESSION STATUS'}
                            </h3>
                            <div className="flex items-center space-x-3 mt-2">
                              <span className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                              <span className="text-sm text-gray-300">
                                {isSessionActive ? `Lap ${currentLap} • AI Updates Every 10s` : `Final Lap ${finalLap} • Data Frozen`}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400 font-orbitron">CURRENT LAP</div>
                            <div className="text-xl font-bold text-red-500">{predictions.lap}</div>
                          </div>
                        </div>
                      </div>

                      {/* System Status Card */}
                      <div className="rounded-xl bg-black/50 p-5 border border-white/5">
                        <h3 className="text-sm text-gray-300 font-orbitron tracking-wider mb-4">SYSTEM STATUS</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Data Feed</span>
                            <span className={`text-sm ${isSessionActive ? 'text-green-400' : 'text-red-400'}`}>
                              ● {isSessionActive ? 'LIVE' : 'FROZEN'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">AI Processing</span>
                            <span className="text-green-400 text-sm">● ACTIVE</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Session</span>
                            <span className={isSessionActive ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                              ● {isSessionActive ? "ACTIVE" : "CLOSED"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Session Info Only */}
                  <div className="xl:col-span-1">
                    <div className="rounded-xl p-1 bg-gradient-to-tr from-red-700 to-transparent shadow-lg">
                      <div className="bg-black/60 rounded-xl p-5">
                        <SessionInfo
                          session={{
                            session_id: sessionId,
                            vehicle_id: parseInt(vehicleId),
                            race_name: "Race 1",
                            created_at: new Date().toISOString(),
                            status: isSessionActive ? 'active' : 'closed'
                          }}
                          predictions={predictions}
                          onSessionClosed={handleSessionClose}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Telemetry View */}
              {activeView === 'telemetry' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/20 to-white/5">
                  <div className="bg-black/60 rounded-2xl p-6">
                    <TelemetryCharts 
                      vehicleId={parseInt(vehicleId)} 
                      predictions={predictions} 
                      liveData={liveData}
                      isSessionActive={isSessionActive}
                    />
                  </div>
                </motion.div>
              )}

              {/* Predictions View */}
              {activeView === 'predictions' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/20 to-white/5">
                  <div className="bg-black/60 rounded-2xl p-6">
                    <LiveMetrics vehicleId={parseInt(vehicleId)} predictions={predictions} />
                  </div>
                </motion.div>
              )}

              {/* Track View */}
              {activeView === 'track' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/20 to-white/5">
                  <div className="bg-black/60 rounded-2xl p-6">
                    <TrackMap vehicleId={parseInt(vehicleId)} predictions={predictions}/>
                  </div>
                </motion.div>
              )}

              {/* Metrics View */}
              {activeView === 'metrics' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/20 to-white/5">
                    <div className="bg-black/60 rounded-2xl p-6">
                      <SessionInfo
                        session={{
                          session_id: sessionId,
                          vehicle_id: parseInt(vehicleId),
                          race_name: "Race 1",
                          created_at: new Date().toISOString(),
                          status: isSessionActive ? 'active' : 'closed'
                        }}
                        predictions={predictions}
                        onSessionClosed={handleSessionClose}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/20 to-white/5">
                    <div className="bg-black/60 rounded-2xl p-6">
                      <LiveMetrics vehicleId={parseInt(vehicleId)} predictions={predictions} />
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

        </div>

        {error && (
          <div className="fixed bottom-6 right-6 bg-red-900/70 border border-red-600 rounded-lg p-4 backdrop-blur-sm max-w-sm z-50">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              <div>
                <div className="text-sm text-yellow-100">{error}</div>
                <div className="text-xs text-gray-300 mt-1">Using live data with AI analysis</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Small theme badge */}
      <div className="fixed left-6 bottom-6 text-xs text-gray-300 bg-black/50 px-3 py-2 rounded-full border border-white/5 backdrop-blur-sm">
        Toyota Theme • Gazoo Racing • {isSessionActive ? 'LIVE' : 'SESSION CLOSED'}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
        .font-orbitron { font-family: 'Orbitron', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }

        @keyframes grid-pan {
          0% { background-position: 0 0; }
          100% { background-position: 200px 200px; }
        }
        .animate-grid-pan { animation: grid-pan 30s linear infinite; }

        @keyframes rpm {
          0% { transform: scaleY(0.35); opacity: 0.45; }
          100% { transform: scaleY(0.35); opacity: 0.45; }
        }
        .animate-rpm { animation: rpm 0.9s infinite cubic-bezier(.4,0,.2,1); }

        .rounded-2xl { border-radius: 1rem; }
      `}</style>
    </div>
  );
}