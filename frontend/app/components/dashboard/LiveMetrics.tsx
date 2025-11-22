'use client';

import { motion } from "framer-motion";
import { AllPredictionsResponse } from '../../lib/types';

interface Metric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  maxValue: number;
  icon: string;
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

  const getTrendIcon = (trend: string) =>
    trend === "up" ? "↗" : trend === "down" ? "↘" : "";

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

  const predictionIndicators = Object.entries(predictions ?? {}).map(
    ([key, value]) => ({
      label: key.replace(/_/g, ' ').toUpperCase(),
      value: typeof value === 'object' && value !== null && 'value' in value
        ? value.value
        : typeof value === 'number'
          ? value
          : JSON.stringify(value),
      trend: typeof value === 'object' && value !== null && 'trend' in value
        ? value.trend
        : 'stable',
      color: "text-white",
    })
  );

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
          LIVE METRICS
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
              <span className="text-2xl">{metric.icon}</span>
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

      {/* PREDICTIONS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-7 mt-3"
      >
        {predictionIndicators.map((indicator) => (
          <div
            key={indicator.label}
            className="
              bg-gradient-to-br from-black via-gray-900 to-gray-800
              border border-red-600/20
              shadow-[0_0_12px_rgba(255,0,0,0.2)]
              hover:shadow-[0_0_25px_rgba(255,0,0,0.35)]
              transition duration-300
              flex flex-col items-center justify-center
              min-h-[120px] px-4 py-3
              text-center
              break-all break-words whitespace-normal
            "
          >
            <div className="text-sm text-gray-400 mb-2 tracking-wide">
              {indicator.label}
            </div>

            <div className="flex flex-col items-center justify-center space-y-1 w-full">
              <span
                className="
                  text-xl font-bold font-orbitron text-white
                  break-all break-words whitespace-normal
                  max-w-full
                "
              >
                {String(indicator.value)}
              </span>

              <span className={`text-lg ${getTrendColor(indicator.trend)}`}>
                {getTrendIcon(indicator.trend)}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
