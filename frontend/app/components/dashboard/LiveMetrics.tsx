'use client';

import { motion, AnimatePresence } from "framer-motion";
import { AllPredictionsResponse } from '../../lib/types';
import { useState, useEffect } from 'react';

interface Metric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  maxValue: number;
}

interface LiveMetricsProps {
  vehicleId: number;
  metrics?: Metric[];
  predictions: AllPredictionsResponse;
  lastUpdate?: string;
}

export default function LiveMetrics({
  vehicleId,
  metrics,
  predictions,
  lastUpdate,
}: LiveMetricsProps) {
  const [expandedPredictions, setExpandedPredictions] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);

  // Fix hydration by ensuring this only runs on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getTrendIcon = (trend: string) =>
    trend === "up" ? "" : trend === "down" ? "" : "";

  const getTrendColor = (trend: string) =>
    trend === "up"
      ? "text-red-400"
      : trend === "down"
      ? "text-green-400"
      : "text-gray-400";

  const getProgressColor = (value: number, maxValue: number) => {
    const pct = (value / maxValue) * 100;
    if (pct > 80) return "bg-red-600";
    if (pct > 60) return "bg-red-500";
    if (pct > 40) return "bg-gray-500";
    return "bg-gray-400";
  };

  const togglePrediction = (predictionKey: string) => {
    setExpandedPredictions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(predictionKey)) {
        newSet.delete(predictionKey);
      } else {
        newSet.add(predictionKey);
      }
      return newSet;
    });
  };

  // 3 main prediction cards with dropdown explanations
  const predictionCardsWithDropdown = [
    {
      key: 'lap_time',
      label: 'PREDICTED LAP TIME',
      value: `${predictions.lap_time?.toFixed(3) || '0.000'}s`,
      trend: 'stable' as const,
      color: "text-white",
      confidence: predictions.lap_time_confidence,
      explanation: predictions.lap_time_explanation || "AI analysis of lap time prediction based on current telemetry data."
    },
    {
      key: 'pit_imminent',
      label: 'PIT STOP STATUS',
      value: predictions.pit_imminent ? 'IMMINENT' : 'CLEAR',
      trend: predictions.pit_imminent ? 'up' : 'down' as const,
      color: predictions.pit_imminent ? "text-red-400" : "text-green-400",
      confidence: predictions.pit_probability,
      explanation: predictions.pit_explanation || "AI analysis of pit stop probability based on tire wear and performance metrics."
    },
    {
      key: 'tire_compound',
      label: 'TIRE COMPOUND',
      value: predictions.tire_compound || 'MEDIUM',
      trend: 'stable' as const,
      color: "text-white",
      confidence: predictions.tire_confidence,
      explanation: predictions.tire_explanation || "AI analysis of optimal tire compound based on track conditions and wear patterns."
    }
  ];

  // Static cards without dropdowns
  const staticCards = [
    {
      key: 'vehicle_id',
      label: 'VEHICLE ID',
      value: `#${predictions.vehicle_id}`,
      trend: 'stable' as const,
      color: "text-white",
    },
    {
      key: 'lap',
      label: 'CURRENT LAP',
      value: predictions.lap.toString(),
      trend: 'up' as const,
      color: "text-white",
    },
    {
      key: 'lap_time_confidence',
      label: 'LAP TIME CONFIDENCE',
      value: `${((predictions.lap_time_confidence || 0) * 100).toFixed(1)}%`,
      trend: 'stable' as const,
      color: "text-blue-400",
    },
    {
      key: 'pit_probability',
      label: 'PIT STOP PROBABILITY',
      value: `${((predictions.pit_probability || 0) * 100).toFixed(1)}%`,
      trend: predictions.pit_imminent ? 'up' : 'down' as const,
      color: predictions.pit_imminent ? "text-red-400" : "text-green-400",
    },
    {
      key: 'tire_confidence',
      label: 'TIRE CONFIDENCE',
      value: `${((predictions.tire_confidence || 0) * 100).toFixed(1)}%`,
      trend: 'stable' as const,
      color: "text-yellow-400",
    },
    {
      key: 'session_id',
      label: 'SESSION ID',
      value: predictions.session_id?.slice(0, 8) + '...' || 'N/A',
      trend: 'stable' as const,
      color: "text-gray-400",
    }
  ];

  // Don't render until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="
        bg-gradient-to-br from-black via-gray-900 to-gray-800
        rounded-2xl p-7
        border border-red-600/30
        shadow-[0_0_25px_rgba(255,0,0,0.25)]
        space-y-10
        min-h-[400px] flex items-center justify-center
      ">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        bg-gradient-to-br from-black via-gray-900 to-gray-800
        rounded-2xl p-7
        border border-red-600/30
        shadow-[0_0_25px_rgba(255,0,0,0.25)]
        space-y-10
      "
    >

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="
          text-3xl font-bold font-orbitron
          bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent
        ">
          PREDICTION METRICS
        </h2>

        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <span className="text-sm text-gray-400">Last: {lastUpdate}</span>
          )}
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-400 font-semibold text-sm">LIVE</span>
          </span>
        </div>
      </div>

      {/* METRICS */}
      <motion.div
        className="grid gap-7 md:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.09 },
          },
        }}
      >
        {metrics && metrics.map((metric) => (
          <motion.div
            key={metric.label}
            className="
              bg-gradient-to-br from-black via-gray-900 to-gray-800
              rounded-xl p-6
              border border-red-600/20
              shadow-[0_0_18px_rgba(255,0,0,0.15)]
              hover:shadow-[0_0_22px_rgba(255,0,0,0.3)]
              hover:border-red-500/40
              hover:scale-[1.03]
              transition duration-300
              flex flex-col gap-2
            "
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 8 },
            }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`text-xl ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
              </span>
            </div>

            <div className="text-sm text-gray-400 font-medium uppercase tracking-wide">
              {metric.label}
            </div>

            <div className="flex items-end justify-between mb-1">
              <span className="text-3xl font-bold font-orbitron text-white">
                {metric.value.toFixed(2)}
              </span>
              <span className="text-base text-gray-400">{metric.unit}</span>
            </div>

            <div className="w-full bg-gray-700 rounded h-2 overflow-hidden">
              <div
                className={`h-2 rounded ${getProgressColor(metric.value, metric.maxValue)}`}
                style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{metric.maxValue}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 3 MAIN PREDICTION CARDS WITH DROPDOWN EXPLANATIONS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3"
      >
        {predictionCardsWithDropdown.map((card) => (
          <div
            key={card.key}
            className={`
              bg-gradient-to-br from-black via-gray-900 to-gray-800
              border border-red-600/20
              shadow-[0_0_18px_rgba(255,0,0,0.15)]
              hover:shadow-[0_0_22px_rgba(255,0,0,0.3)]
              transition-all duration-300
              rounded-xl overflow-hidden
              ${expandedPredictions.has(card.key) ? 'ring-2 ring-red-500/50' : ''}
            `}
          >
            {/* Clickable Card Area */}
            <button
              onClick={() => togglePrediction(card.key)}
              className="w-full flex flex-col items-center justify-center min-h-[160px] px-4 py-6 text-center transition-all duration-300 hover:bg-gray-800/20 relative"
            >
              <div className="flex justify-between items-center w-full mb-3">
                <span className={`text-xl ${getTrendColor(card.trend)}`}>
                  {getTrendIcon(card.trend)}
                </span>
              </div>

              <div className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-2">
                {card.label}
              </div>

              <div className="flex flex-col items-center justify-center space-y-1 w-full mb-3">
                <span
                  className="
                    text-2xl font-bold font-orbitron
                    break-all break-words whitespace-normal
                    max-w-full
                  "
                  style={{ color: card.color }}
                >
                  {String(card.value)}
                </span>
              </div>

              {/* Confidence Bar */}
              <div className="w-full max-w-[140px] bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000`}
                  style={{ width: `${(card.confidence || 0) * 100}%` }}
                ></div>
              </div>

              <div className="text-xs text-gray-400">
                Confidence: {((card.confidence || 0) * 100).toFixed(1)}%
              </div>

              {/* Expand Indicator */}
              <motion.div
                animate={{ rotate: expandedPredictions.has(card.key) ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-3 right-3 w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600/50"
              >
                <span className="text-gray-400 text-xs">▼</span>
              </motion.div>
            </button>

            {/* AI Explanation - Expandable Section */}
            <AnimatePresence>
              {expandedPredictions.has(card.key) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-red-600/20 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-900 via-gray-800 to-red-700 rounded-full flex items-center justify-center shadow-md border border-red-400 flex-shrink-0 mt-1">
                        <span className="text-red-200 text-xs font-bold tracking-wide">AI</span>
                      </div>
                      <div className="flex-1">
                        
                        <p className="text-white leading-relaxed text-sm">
                          {card.explanation}
                        </p>
                        <div className="mt-2 flex items-center space-x-3 text-xs text-gray-400">
                          <span>Real-time analysis</span>
                          <span>•</span>
                          <span>Telemetry data</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {/* STATIC CARDS WITHOUT DROPDOWNS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
      >
        {staticCards.map((card) => (
          <div
            key={card.key}
            className="
              bg-gradient-to-br from-black via-gray-900 to-gray-800
              rounded-xl p-6
              border border-red-600/20
              shadow-[0_0_18px_rgba(255,0,0,0.15)]
              hover:shadow-[0_0_22px_rgba(255,0,0,0.3)]
              hover:border-red-500/40
              hover:scale-[1.03]
              transition duration-300
              flex flex-col items-center justify-center
              text-center
              min-h-[140px]
            "
          >
            <div className="flex justify-between items-center w-full mb-3">
              <span className={`text-xl ${getTrendColor(card.trend)}`}>
                {getTrendIcon(card.trend)}
              </span>
            </div>

            <div className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-2">
              {card.label}
            </div>

            <div className="flex flex-col items-center justify-center space-y-1 w-full">
              <span
                className="
                  text-2xl font-bold font-orbitron
                  break-all break-words whitespace-normal
                  max-w-full
                "
                style={{ color: card.color }}
              >
                {String(card.value)}
              </span>
            </div>

            {/* Progress bars for confidence/probability static cards */}
            {(card.key.includes('confidence') || card.key.includes('probability')) && (
              <div className="w-full max-w-[120px] bg-gray-700 rounded-full h-2 mt-3">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000`}
                  style={{ 
                    width: `${parseFloat(card.value) || 0}%`,
                    backgroundColor: card.key.includes('pit') ? 
                      (predictions.pit_imminent ? '#ef4444' : '#10b981') : undefined
                  }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}