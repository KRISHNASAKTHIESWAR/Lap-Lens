"use client";
import React, { useEffect, useMemo, useState } from "react";
import { applyStrategy, simulateScenarios, type SimulateOption } from "../utils/api";

const STRATEGY_OPTIONS = [0, 1, 2];

function formatGain(value: number): string {
  const rounded = value.toFixed(2);
  return value > 0 ? `+${rounded}s` : `${rounded}s`;
}

function getRiskBadge(score: number) {
  if (score < 35) {
    return { label: "Low", className: "bg-emerald-100 text-emerald-700" };
  }
  if (score < 70) {
    return { label: "Medium", className: "bg-amber-100 text-amber-700" };
  }
  return { label: "High", className: "bg-rose-100 text-rose-700" };
}

interface StrategyFeedback {
  type: "success" | "error";
  message: string;
}

export default function SimulationModal({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const [results, setResults] = useState<SimulateOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLap, setCurrentLap] = useState("5");
  const [tireDeg, setTireDeg] = useState("0.05");
  const [pitTime, setPitTime] = useState("25");
  const [freshBenefit, setFreshBenefit] = useState("1.5");
  const [entered, setEntered] = useState(false);
  const [applyLoading, setApplyLoading] = useState<number | null>(null);
  const [applyFeedback, setApplyFeedback] = useState<StrategyFeedback | null>(null);

  useEffect(() => {
    if (!results) {
      setEntered(false);
      return;
    }
    setEntered(false);
    const raf = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(raf);
  }, [results]);

  const cards = useMemo(() => {
    const map = new Map<number, SimulateOption>();
    results?.forEach((option) => {
      map.set(option.option, option);
    });

    return STRATEGY_OPTIONS.map((option) => ({
      option,
      label: option === 0 ? "Pit Now" : `Pit +${option}`,
      data: map.get(option) ?? null,
    }));
  }, [results]);

  const bestCard = useMemo(() => {
    const available = cards.filter((card) => card.data);
    if (!available.length) {
      return null;
    }
    return available.reduce((best, current) => {
      if (!best.data || !current.data) {
        return best;
      }
      return current.data.predicted_total_time < best.data.predicted_total_time ? current : best;
    });
  }, [cards]);

  async function run() {
    try {
      setLoading(true);
      setError(null);
      setApplyFeedback(null);

      const lapValue = Number.parseInt(currentLap, 10);
      const tireValue = Number.parseFloat(tireDeg);
      const pitValue = Number.parseFloat(pitTime);
      const benefitValue = Number.parseFloat(freshBenefit);

      if (!Number.isFinite(lapValue) || lapValue < 1) {
        throw new Error("Current lap must be a positive integer");
      }
      if (!Number.isFinite(tireValue) || tireValue < 0) {
        throw new Error("Tire degradation must be a non-negative number");
      }
      if (!Number.isFinite(pitValue) || pitValue < 0) {
        throw new Error("Pit time must be zero or greater");
      }
      if (!Number.isFinite(benefitValue) || benefitValue < 0) {
        throw new Error("Fresh tire benefit must be zero or greater");
      }

      const data = await simulateScenarios({
        session_id: sessionId,
        current_lap: lapValue,
        tire_deg_index: tireValue,
        options: STRATEGY_OPTIONS,
        pit_time_seconds: pitValue,
        fresh_tire_benefit: benefitValue,
      });
      setResults(data.comparison);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run simulation");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(option: number) {
    if (!results) {
      return;
    }
    try {
      setApplyLoading(option);
      setApplyFeedback(null);
      const response = await applyStrategy({ session_id: sessionId, strategy_option: option });
      setApplyFeedback({ type: "success", message: response.message ?? "Strategy queued" });
    } catch (e) {
      setApplyFeedback({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to apply strategy",
      });
    } finally {
      setApplyLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80" onClick={onClose}>
      <div className="w-[32rem] max-w-full rounded bg-white p-6 shadow" onClick={(event) => event.stopPropagation()}>
        <h3 className="text-lg font-medium mb-3">Simulation</h3>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <label className="flex flex-col">
            <span className="text-gray-600">Current Lap</span>
            <input value={currentLap} onChange={(e) => setCurrentLap(e.target.value)} className="border rounded px-2 py-1" />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-600">Tire Deg</span>
            <input value={tireDeg} onChange={(e) => setTireDeg(e.target.value)} className="border rounded px-2 py-1" />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-600">Pit Time (s)</span>
            <input value={pitTime} onChange={(e) => setPitTime(e.target.value)} className="border rounded px-2 py-1" />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-600">Fresh Tire Gain (s)</span>
            <input value={freshBenefit} onChange={(e) => setFreshBenefit(e.target.value)} className="border rounded px-2 py-1" />
          </label>
        </div>

        <div className="mb-3 flex items-center">
          <button type="button" onClick={run} className="px-3 py-2 bg-indigo-600 text-white rounded" disabled={loading}>
            {loading ? "Running..." : "Run"}
          </button>
          <button type="button" onClick={onClose} className="ml-2 px-3 py-2 bg-gray-200 rounded">Close</button>
        </div>

        {error && <div className="text-sm text-rose-600 mb-2">{error}</div>}

        <div>
          {results ? (
            <div className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {cards.map((card, index) => {
                  const isBest = bestCard?.option === card.option && Boolean(card.data);
                  const badge = card.data ? getRiskBadge(card.data.risk_score) : null;
                  const baseClasses = `relative flex flex-col rounded-md p-4 transition-all duration-300 ease-out transform ${
                    entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  } ${isBest ? "border-2 border-emerald-500 shadow-lg bg-emerald-50" : "border border-gray-200 bg-white"}`;

                  return (
                    <div
                      key={card.option}
                      className={baseClasses}
                      style={{ transitionDelay: entered ? `${index * 80}ms` : "0ms" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold">{card.label}</h4>
                        {badge ? (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
                            title={`Risk score ${card.data?.risk_score.toFixed(1)}`}
                          >
                            {badge.label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No data</span>
                        )}
                      </div>
                      {isBest && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          Best Option
                        </span>
                      )}

                      {card.data ? (
                        <>
                          <div className="text-sm text-gray-600">Predicted Total Time</div>
                          <div className="text-2xl font-semibold mb-3">{card.data.predicted_total_time.toFixed(2)}s</div>
                          <div className="text-sm mb-4">
                            <span className="text-gray-600">Relative Gain:&nbsp;</span>
                            <span
                              className={
                                card.data.relative_gain > 0
                                  ? "text-emerald-600 font-medium"
                                  : card.data.relative_gain < 0
                                  ? "text-rose-600 font-medium"
                                  : "font-medium"
                              }
                            >
                              {formatGain(card.data.relative_gain)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleApply(card.option)}
                            className={`mt-auto inline-flex items-center justify-center rounded px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                              isBest ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                            disabled={applyLoading === card.option}
                          >
                            {applyLoading === card.option ? "Applying..." : "Apply Strategy"}
                          </button>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">Option not available.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No results yet</div>
          )}
        </div>

        {applyFeedback && (
          <div className={`mt-3 text-sm ${applyFeedback.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
            {applyFeedback.message}
          </div>
        )}
      </div>
    </div>
  );
}
