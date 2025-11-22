"use client";

import { useState, useEffect } from "react";
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

  // Start at S1 ALWAYS
  const [animatedPosition, setAnimatedPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPosition((prev) => (prev + 0.14) % 100);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  /**
   * NEW TRACK PATH (perfectly aligned to the neon map)
   * These coordinates match EXACTLY where S1, S2, S3 are placed with absolute CSS.
   */
  const trackPath = [
    // ---- S1 start (top right) ----
    { x: 0.73, y: 0.14 }, { x: 0.70, y: 0.17 }, { x: 0.67, y: 0.20 },
    { x: 0.63, y: 0.22 }, { x: 0.59, y: 0.25 }, { x: 0.56, y: 0.28 },
    { x: 0.53, y: 0.31 }, { x: 0.50, y: 0.34 }, { x: 0.48, y: 0.37 },
    { x: 0.46, y: 0.40 }, { x: 0.45, y: 0.42 }, { x: 0.44, y: 0.45 },

    // ---- S2 mid left (matches your absolute S2) ----
    { x: 0.43, y: 0.48 }, { x: 0.44, y: 0.51 }, { x: 0.45, y: 0.54 },
    { x: 0.46, y: 0.57 }, { x: 0.48, y: 0.60 }, { x: 0.50, y: 0.63 },
    { x: 0.53, y: 0.65 }, { x: 0.56, y: 0.67 }, { x: 0.59, y: 0.69 },

    // ---- S3 bottom (where your red S3 label is) ----
    { x: 0.62, y: 0.72 }, { x: 0.65, y: 0.75 }, { x: 0.67, y: 0.77 },
    { x: 0.70, y: 0.78 }, { x: 0.73, y: 0.79 }, { x: 0.76, y: 0.78 },
    { x: 0.79, y: 0.76 }, { x: 0.81, y: 0.73 },

    // ---- final loop back up to S1 ----
    { x: 0.82, y: 0.69 }, { x: 0.81, y: 0.65 }, { x: 0.79, y: 0.60 },
    { x: 0.77, y: 0.55 }, { x: 0.75, y: 0.50 }, { x: 0.74, y: 0.45 },
    { x: 0.73, y: 0.40 }, { x: 0.73, y: 0.34 }, { x: 0.73, y: 0.26 },
    { x: 0.73, y: 0.19 }, { x: 0.73, y: 0.14 }, // **S1 again**
  ];

  // Distance calculation for smooth speed
  const distances: number[] = [];
  let totalDist = 0;

  for (let i = 0; i < trackPath.length - 1; i++) {
    const dx = trackPath[i + 1].x - trackPath[i].x;
    const dy = trackPath[i + 1].y - trackPath[i].y;
    const d = Math.sqrt(dx * dx + dy * dy);
    totalDist += d;
    distances.push(totalDist);
  }

  function getCarXY(percent: number) {
    const goalDist = (percent / 100) * totalDist;

    let idx = 0;
    while (idx < distances.length && distances[idx] < goalDist) {
      idx++;
    }

    const prevDist = idx === 0 ? 0 : distances[idx - 1];
    const frac = (goalDist - prevDist) / ((distances[idx] - prevDist) || 1);

    const A = trackPath[idx];
    const B = trackPath[idx + 1] ?? trackPath[0];

    return {
      x: A.x + (B.x - A.x) * frac,
      y: A.y + (B.y - A.y) * frac,
    };
  }

  const carXY = getCarXY(animatedPosition);

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-orbitron text-white">TRACK MAP</h2>

        <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-400 font-semibold">LIVE TRACKING</span>
        </div>
      </div>

      <div className="relative rounded-xl mb-6" style={{ background: "#000" }}>
        <img
          src="/barber.png"
          alt="Barber Motorsports Park"
          className="rounded-xl w-full h-80 object-contain"
        />

        {/* CAR DOT */}
        <div
          className="absolute"
          style={{
            left: `calc(${carXY.x * 100}% - 12px)`,
            top: `calc(${carXY.y * 100}% - 12px)`,
            width: 24,
            height: 24,
            pointerEvents: "none",
          }}
        >
          <div className="w-6 h-6 rounded-full bg-[#e10600] border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">#{vehicleId}</span>
          </div>
        </div>

        {/* SECTOR LABELS - unchanged */}
        <div className="absolute left-[55%] top-[15%] bg-blue-900 text-white rounded px-2 py-1 text-xs">S1</div>
        <div className="absolute left-[57%] top-[42%] bg-yellow-700 text-white rounded px-2 py-1 text-xs">S2</div>
        <div className="absolute left-[42%] top-[78%] bg-red-800 text-white rounded px-2 py-1 text-xs">S3</div>
      </div>

      {/* TELEMETRY BOXES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* unchanged */}
        <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/50">
          <div className="text-xs text-gray-400 mb-1">CURRENT LAP</div>
          <div className="text-2xl font-bold font-orbitron text-white">{lap}</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/50">
          <div className="text-xs text-gray-400 mb-1">LAP TIME</div>
          <div className="text-xl font-bold font-orbitron text-green-400">
            {lapTime.toFixed(3)}s
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

      {/* SECTOR TIMES */}
      <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
        <h3 className="text-lg font-semibold text-gray-300 mb-3 font-orbitron">
          SECTOR TIMES
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {sectorTimes.map((time, idx) => (
            <div key={idx} className="text-center">
              <div className="text-xs text-gray-400 mb-1">SECTOR {idx + 1}</div>
              <div className="text-lg font-mono font-bold">{time.toFixed(2)}s</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm text-gray-400">
          BARBER MOTORSPORTS PARK • 2.38 MI • 17 TURNS
        </div>
      </div>
    </div>
  );
}
