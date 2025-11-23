"use client";

import { AllPredictionsResponse } from "../../analysis/page";

interface TrackMapProps {
  vehicleId: number;
  predictions: AllPredictionsResponse | null;
  carPosition?: number;
  sectorTimes?: number[];
}

export default function TrackMap({
  vehicleId,
  predictions,
  carPosition = 0,
  sectorTimes = [0, 0, 0],
}: TrackMapProps) {
  const lap = predictions?.lap ?? 1;
  const lapTime = predictions?.lap_time ?? 0;
  const pitImminent = predictions?.pit_imminent ?? false;
  const tireCompound = predictions?.tire_compound ?? "MEDIUM";

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-orbitron text-white">TRACK MAP</h2>

        <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-400 font-semibold">LIVE TRACKING</span>
        </div>
      </div>

      <div className="relative rounded-xl mb-6 bg-black">
        <img
          src="/barber.png"
          alt="Barber Motorsports Park"
          className="rounded-xl w-full h-80 object-contain"
        />
      </div>

      {/* TELEMETRY BOXES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/50">
          <div className="text-xs text-gray-400 mb-1">CURRENT LAP</div>
          <div className="text-2xl font-bold font-orbitron text-white">{lap}</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/50">
          <div className="text-xs text-gray-400 mb-1">LAP TIME</div>
          <div className="text-xl font-bold font-orbitron text-green-400">
            {lapTime > 0 ? `${lapTime.toFixed(3)}s` : "--.--"}
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/50">
          <div className="text-xs text-gray-400 mb-1">PIT IMMINENT</div>
          <div
            className={`text-xl font-bold font-orbitron ${
              pitImminent ? "text-red-400 animate-pulse" : "text-white"
            }`}
          >
            {pitImminent ? "YES" : "NO"}
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/50">
          <div className="text-xs text-gray-400 mb-1">TIRE COMPOUND</div>
          <div className="text-xl font-bold font-orbitron text-yellow-300">
            {tireCompound}
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-400">
          BARBER MOTORSPORTS PARK • 2.38 MI • 17 TURNS
        </div>
      </div>
    </div>
  );
}