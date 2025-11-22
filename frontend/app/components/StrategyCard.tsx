"use client";
import React, { useEffect, useState } from "react";
import SimulationModal from "./SimulationModal";
import { getPredict, type PredictResponse } from "../utils/api";

export default function StrategyCard({ sessionId }: { sessionId: string }) {
  const [predict, setPredict] = useState<PredictResponse | null>(null);
  const [openSim, setOpenSim] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchOnce() {
      try {
        const data = await getPredict(sessionId);
        if (mounted) setPredict(data);
      } catch (e) {
        console.warn("predict error", e);
      }
    }

    fetchOnce();
    const id = setInterval(fetchOnce, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [sessionId]);

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-medium mb-2">Strategy</h2>
      {predict ? (
        <div className="space-y-2">
          <div>Optimal Pit Lap: <strong>{predict.optimal_pit_lap}</strong></div>
          <div>Current Lap: <strong>{predict.current_lap}</strong></div>
          <div>Tire Degradation: <strong>{predict.tire_deg_index}</strong></div>
          <div>Expected Gain: <strong>{predict.expected_gain}s</strong></div>
          <div>Confidence: <strong>{Math.round(predict.confidence * 100)}%</strong></div>
          <div className="text-sm text-gray-500">{predict.reason}</div>
          <div className="pt-3">
            <button onClick={() => setOpenSim(true)} className="px-3 py-1 bg-indigo-600 text-white rounded">Run Simulation</button>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}

      {openSim && <SimulationModal sessionId={sessionId} onClose={() => setOpenSim(false)} />}
    </div>
  );
}
