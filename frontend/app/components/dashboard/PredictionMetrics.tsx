'use client';

import { AllPredictionsResponse } from '../../lib/types';

interface PredictionMetricsProps {
  predictions: AllPredictionsResponse;
}

export default function PredictionMetrics({ predictions }: PredictionMetricsProps) {
  const formatLapTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(3);
    return `${minutes}:${remainingSeconds.padStart(6, '0')}`;
  };

  const cardStyle =
    'bg-gradient-to-br from-black via-gray-900 to-gray-800 rounded-2xl p-6 border border-[#1a1a1a]  hover:shadow-[0_0_28px_rgba(255,0,0,0.3)] transition-shadow duration-500';

  const titleStyle =
    'text-lg font-semibold text-gray-300 tracking-widest border-b border-red-600/40 pb-2 mb-4';

  const barContainer = 'w-40 bg-[#1a1a1a] rounded-full h-2 overflow-hidden shadow-inner';
  const barBase =
    'h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_currentColor]';

  return (
    <div className=" grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* LAP TIME */}
      <div className={cardStyle} >
        <h3 className={titleStyle}>LAP TIME PREDICTION</h3>

        <div className="text-center ">
          <div className="text-4xl font-orbitron font-bold text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.25)] mb-3">
            {formatLapTime(predictions.lap_time)}
          </div>

          <div className="flex items-center justify-center space-x-3">
            <div
              className={barContainer}
              title={`Confidence: ${(predictions.lap_time_confidence * 100).toFixed(1)}%`}
            >
              <div
                className={`${barBase} bg-red-500`}
                style={{ width: `${predictions.lap_time_confidence * 100}%` }}
              ></div>
            </div>

            <span className="text-sm text-gray-400 tracking-wider">
              {(predictions.lap_time_confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* PIT STOP */}
      <div className={cardStyle}>
        <h3 className={titleStyle}>PIT STOP ANALYSIS</h3>

        <div className="text-center">
          <div
            className={`text-3xl font-orbitron font-bold mb-3 drop-shadow-[0_0_8px_currentColor] ${
              predictions.pit_imminent ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {predictions.pit_imminent ? 'PIT IMMINENT' : 'CLEAR'}
          </div>

          <div className="flex items-center justify-center space-x-3">
            <div
              className={barContainer}
              title={`Probability: ${(predictions.pit_probability * 100).toFixed(1)}%`}
            >
              <div
                className={`${barBase} bg-red-400`}
                style={{ width: `${predictions.pit_probability * 100}%` }}
              ></div>
            </div>

            <span className="text-sm text-gray-400 tracking-wider">
              {(predictions.pit_probability * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* TIRE COMPOUND */}
      <div className={cardStyle}>
        <h3 className={titleStyle}>TIRE COMPOUND</h3>

        <div className="text-center">
          <div className="text-3xl font-orbitron font-bold text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.25)] mb-3">
            {predictions.tire_compound}
          </div>

          <div className="flex items-center justify-center space-x-3">
            <div
              className={barContainer}
              title={`Confidence: ${(predictions.tire_confidence * 100).toFixed(1)}%`}
            >
              <div
                className={`${barBase} bg-red-300`}
                style={{ width: `${predictions.tire_confidence * 100}%` }}
              ></div>
            </div>

            <span className="text-sm text-gray-400 tracking-wider">
              {(predictions.tire_confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

    </div>
        
  );
}
