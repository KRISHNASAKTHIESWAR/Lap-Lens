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

const safeNumber = (value: any, fallback: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

type ActiveView = 'overview' | 'telemetry' | 'predictions' | 'track' | 'metrics';

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const vehicleId = searchParams.get('vehicle_id');

  const [predictions, setPredictions] = useState<AllPredictionsResponse| null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('overview');

  useEffect(() => {
    if (sessionId && vehicleId) {
      fetchPredictions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, vehicleId]);

  const fetchPredictions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const vehicleNum = parseInt(vehicleId!);

      const baseData = {
        session_id: sessionId!,
        vehicle_id: vehicleNum,
        lap: Math.floor(Math.random() * 50) + 1,
        max_speed: 280 + (Math.random() * 40),
        avg_speed: 180 + (Math.random() * 60),
        std_speed: 5 + (Math.random() * 10),
        avg_throttle: 60 + (Math.random() * 35),
        brake_front_freq: 0.5 + (Math.random() * 2),
        brake_rear_freq: 0.5 + (Math.random() * 2),
        dominant_gear: Math.floor(Math.random() * 8) + 1,
        avg_steer_angle: 2 + (Math.random() * 8),
        avg_long_accel: 0.5 + (Math.random() * 2),
        avg_lat_accel: 1 + (Math.random() * 3),
        avg_rpm: 8000 + (Math.random() * 3000),
        rolling_std_lap_time: 0.5 + (Math.random() * 2),
        lap_time_delta: -2 + (Math.random() * 4),
        tire_wear_high: 10 + (Math.random() * 40),
        air_temp: 20 + (Math.random() * 15),
        track_temp: 25 + (Math.random() * 20),
        humidity: 30 + (Math.random() * 50),
        pressure: 1000 + (Math.random() * 20),
        wind_speed: 1 + (Math.random() * 10),
        wind_direction: Math.random() * 360,
        rain: Math.random() > 0.8 ? 1 : 0
      };

      const [lapTimeRes, pitRes, tireRes] = await Promise.all([
        fetch('http://localhost:8000/api/predict/lap-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(baseData)
        }),
        fetch('http://localhost:8000/api/predict/pit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(baseData)
        }),
        fetch('http://localhost:8000/api/predict/tire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(baseData)
        })
      ]);

      const [lapTimeData, pitData, tireData] = await Promise.all([
        lapTimeRes.json(),
        pitRes.json(),
        tireRes.json()
      ]);

      const allPredictions: AllPredictionsResponse = {
        session_id: sessionId!,
        vehicle_id: vehicleNum,
        lap: baseData.lap,
        lap_time: safeNumber(lapTimeData.predicted_lap_time, 85.0),
        lap_time_confidence: safeNumber(lapTimeData.confidence, 0.85),
        pit_imminent: pitData.pit_imminent || false,
        pit_probability: safeNumber(pitData.probability, 0.5),
        tire_compound: tireData.suggested_compound || 'MEDIUM',
        tire_confidence: safeNumber(tireData.confidence, 0.75)
      };

      setPredictions(allPredictions);

    } catch (err) {
      console.error('Error:', err);
      setError('Using demo data - Backend connection failed');
      setPredictions({
        session_id: sessionId!,
        vehicle_id: parseInt(vehicleId!),
        lap: 12,
        lap_time: 85.234,
        lap_time_confidence: 0.87,
        pit_imminent: false,
        pit_probability: 0.23,
        tire_compound: 'SOFT',
        tire_confidence: 0.91
      });
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

        {/* Main Content Area */}
        <div className="mt-6 min-h-[600px]">
          {/* Loading state */}
          {isLoading && (
            <div className="min-h-[420px] flex flex-col items-center justify-center">
              <motion.div
                className="w-28 h-28 rounded-full border-8 border-t-transparent border-red-600"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              />

              <h2 className="text-3xl text-white font-bold mt-6 tracking-wider">INITIALIZING SYSTEMS</h2>
              <p className="text-gray-300 mt-2">Vehicle #{vehicleId} • Road to Suzuka — Toyota Gazoo Racing</p>

              <div className="mt-6 flex space-x-1 justify-center">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-8 rounded-sm bg-red-600 animate-rpm" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Loaded views */}
          {!isLoading && (
            <>
              {/* Overview View */}
              {activeView === 'overview' && predictions && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/40 to-white/5 shadow-lg">
                      <div className="bg-black/60 rounded-2xl p-6">
                        <PredictionMetrics predictions={predictions} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-xl p-1 bg-gradient-to-tr from-red-700 to-transparent">
                      <div className="bg-black/60 rounded-lg p-5">
                        <SessionInfo
                          session={{
                            session_id: sessionId,
                            vehicle_id: parseInt(vehicleId),
                            race_name: "Race 1",
                            created_at: new Date().toISOString(),
                            status: 'active'
                          }}
                          predictions={predictions}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-black/50 p-5 border border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm text-gray-300">LIVE STATUS</h3>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-sm text-gray-300">Telemetry • Predictions • Strategy</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">VEHICLE</div>
                          <div className="text-lg font-bold">#{vehicleId}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Telemetry View */}
              {activeView === 'telemetry' && predictions && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/20 to-white/5">
                  <div className="bg-black/60 rounded-2xl p-6">
                    <TelemetryCharts vehicleId={parseInt(vehicleId)} predictions={predictions} />
                  </div>
                </motion.div>
              )}

              {/* Predictions View */}
              {activeView === 'predictions' && predictions && (
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
              {activeView === 'metrics' && predictions && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/20 to-white/5">
                    <div className="bg-black/60 rounded-2xl p-6">
                      <SessionInfo
                        session={{
                          session_id: sessionId,
                          vehicle_id: parseInt(vehicleId),
                          race_name: "Race 1",
                          created_at: new Date().toISOString(),
                          status: 'active'
                        }}
                        predictions={predictions}
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
                <div className="text-xs text-gray-300 mt-1">Falling back to demo predictions</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Small theme badge */}
      <div className="fixed left-6 bottom-6 text-xs text-gray-300 bg-black/50 px-3 py-2 rounded-full border border-white/5 backdrop-blur-sm">
        Toyota Theme • Gazoo Racing
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
          50% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(0.35); opacity: 0.45; }
        }
        .animate-rpm { animation: rpm 0.9s infinite cubic-bezier(.4,0,.2,1); }

        @keyframes bar {
          0% { height: 8px; opacity: .5; }
          50% { height: 32px; opacity: 1; }
          100% { height: 8px; opacity: .5; }
        }

        .animate-bar { animation: bar 1s infinite cubic-bezier(.4,0,.2,1); }

        .rounded-2xl { border-radius: 1rem; }
      `}</style>
    </div>
  );
}
