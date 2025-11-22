'use client';

import { useState, useEffect } from 'react';
import { AllPredictionsResponse } from '../../lib/types';

interface TelemetryChartsProps {
  vehicleId: number;
  predictions: AllPredictionsResponse;
}

export default function TelemetryCharts({ vehicleId, predictions }: TelemetryChartsProps) {
  const [telemetryData, setTelemetryData] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData(prev => {
        const newData = {
          timestamp: Date.now(),
          speed: 200 + Math.random() * 100,
          rpm: 8000 + Math.random() * 4000,
          throttle: Math.random() * 100,
          brake: Math.random() * 100,
          gear: Math.floor(Math.random() * 8) + 1
        };
        return [...prev.slice(-19), newData];
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="
     bg-gradient-to-br from-black via-gray-900 to-gray-800
      backdrop-blur-xl 
      rounded-2xl 
      p-8 
      border border-red-900/30 
      shadow-[0_0_25px_5px_rgba(255,0,0,0.15)] 
    ">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold font-orbitron text-white tracking-widest">
          LIVE TELEMETRY
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-400">STREAMING</span>
        </div>
      </div>

      {/* Speed + RPM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* SPEED */}
        <div className="
          bg-black/50 
          rounded-xl 
          p-6 
          border border-red-800/40 
          shadow-inner shadow-red-900/20
        ">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 tracking-wide">
            SPEED
          </h3>
          <div className="relative h-32 flex items-center justify-center">
            <div className="text-5xl font-bold font-orbitron text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {telemetryData[telemetryData.length - 1]?.speed.toFixed(0) || '0'}
              <span className="text-xl text-gray-500 ml-2">KM/H</span>
            </div>
            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
              GEAR {telemetryData[telemetryData.length - 1]?.gear || '1'}
            </div>
          </div>
        </div>

        {/* RPM */}
        <div className="
          bg-black/50 
          rounded-xl 
          p-6 
          border border-red-800/40 
          shadow-inner shadow-red-900/20
        ">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 tracking-wide">
            RPM
          </h3>
          <div className="relative h-32 flex items-center justify-center">
            <div className="text-5xl font-bold font-orbitron text-red-400 drop-shadow-[0_0_10px_rgba(255,0,0,0.4)]">
              {telemetryData[telemetryData.length - 1]?.rpm.toFixed(0) || '0'}
            </div>
            <div className="absolute bottom-4 right-4">
              <div
                className={`
                  w-3 h-3 rounded-full 
                  ${predictions.pit_imminent 
                    ? 'bg-red-500 animate-ping' 
                    : 'bg-green-500'
                  }
                `}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* Throttle + Brake */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* THROTTLE & BRAKE */}
        <div className="
          bg-black/50 
          rounded-xl 
          p-6 
          border border-red-800/40 
          shadow-inner shadow-red-900/20
        ">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 tracking-wide">
            THROTTLE & BRAKE
          </h3>

          <div className="space-y-4">

            {/* Throttle */}
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>THROTTLE</span>
                <span>{telemetryData[telemetryData.length - 1]?.throttle.toFixed(0) || '0'}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="
                    bg-red-500 
                    h-3 
                    rounded-full 
                    transition-all duration-300 
                    shadow-[0_0_10px_rgba(255,0,0,0.4)]
                  "
                  style={{ width: `${telemetryData[telemetryData.length - 1]?.throttle || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Brake */}
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>BRAKE</span>
                <span>{telemetryData[telemetryData.length - 1]?.brake.toFixed(0) || '0'}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="
                    bg-red-700 
                    h-3 
                    rounded-full 
                    transition-all duration-300 
                    shadow-[0_0_10px_rgba(255,0,0,0.4)]
                  "
                  style={{ width: `${telemetryData[telemetryData.length - 1]?.brake || 0}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>

        {/* LAP TIME */}
        <div className="
          bg-black/50 
          rounded-xl 
          p-6 
          border border-red-800/40 
          shadow-inner shadow-red-900/20
        ">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 tracking-wide">
            PREDICTED LAP TIME
          </h3>

          <div className="text-center">
            <div className="text-4xl font-bold font-orbitron text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
              {predictions.lap_time.toFixed(3)}s
            </div>

            <div className="text-sm text-gray-400">
              Confidence: {(predictions.lap_time_confidence * 100).toFixed(1)}%
            </div>

            <div className="mt-4 w-full bg-gray-800 rounded-full h-2">
              <div
                className="
                  bg-red-600 
                  h-2 
                  rounded-full 
                  transition-all duration-1000 
                  shadow-[0_0_12px_rgba(255,0,0,0.45)]
                "
                style={{ width: `${predictions.lap_time_confidence * 100}%` }}
              ></div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
