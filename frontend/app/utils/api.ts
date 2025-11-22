const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type FetchOptions = RequestInit & { parseJson?: boolean };

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { parseJson = true, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed (${res.status}): ${text}`);
  }

  return (parseJson ? res.json() : (undefined as unknown as T));
}

export type PredictResponse = {
  optimal_pit_lap: number;
  current_lap: number;
  tire_deg_index: number;
  expected_gain: number;
  confidence: number;
  reason: string;
};

export type SimulateOption = {
  option: number;
  pit_in_laps: number;
  predicted_total_remaining_time: number;
  predicted_total_time: number;
  relative_gain: number;
  projected_position: number;
  risk_score: number;
  advice: string;
};

export type SimulateResponse = {
  session_id: string;
  comparison: SimulateOption[];
};

export type ApplyStrategyResponse = {
  session_id: string;
  strategy_option: number;
  status: string;
  message?: string;
};

export function getPredict(sessionId: string) {
  return request<PredictResponse>(`/predict_pit/${sessionId}`);
}

export function simulateScenarios(payload: {
  session_id: string;
  current_lap: number;
  tire_deg_index: number;
  options: number[];
  pit_time_seconds: number;
  fresh_tire_benefit: number;
}) {
  return request<SimulateResponse>(`/simulate_scenarios`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function applyStrategy(payload: { session_id: string; strategy_option: number }) {
  return request<ApplyStrategyResponse>(`/apply_strategy`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

