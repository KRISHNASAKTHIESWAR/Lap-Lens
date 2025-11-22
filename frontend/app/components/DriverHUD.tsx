"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Priority = "high" | "medium" | "low";

type HudAlert = {
  id: string;
  message: string;
  priority: Priority;
  receivedAt: number;
};

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const DISPLAY_MS: Record<Priority, number> = {
  high: 5000,
  medium: 4200,
  low: 3500,
};

const HISTORY_LIMIT = 8;

function normalizeAlert(raw: any): HudAlert | null {
  if (typeof raw === "string") {
    const message = raw.trim();
    if (!message) return null;
    return {
      id: `low-${message}`,
      message,
      priority: "low",
      receivedAt: Date.now(),
    };
  }

  if (!raw || typeof raw !== "object") return null;
  const message = typeof raw.message === "string" ? raw.message.trim() : "";
  const priority = (raw.priority as Priority) || "low";
  const id = typeof raw.id === "string" && raw.id.trim().length ? raw.id : `${priority}-${message}`;
  if (!message) return null;

  return {
    id,
    message,
    priority: ["high", "medium", "low"].includes(priority) ? priority : "low",
    receivedAt: Date.now(),
  };
}

export default function DriverHUD(): JSX.Element {
  const [queue, setQueue] = useState<HudAlert[]>([]);
  const [activeAlert, setActiveAlert] = useState<HudAlert | null>(null);
  const [history, setHistory] = useState<HudAlert[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const seenAlertIds = useRef<Set<string>>(new Set());

  const sortedQueue = useMemo(() => {
    return [...queue].sort((a, b) => {
      if (PRIORITY_WEIGHT[a.priority] === PRIORITY_WEIGHT[b.priority]) {
        return a.receivedAt - b.receivedAt;
      }
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    });
  }, [queue]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const baseHost = process.env.NEXT_PUBLIC_WS_HOST ?? `${window.location.hostname}:8000`;
    const wsUrl = `${protocol}://${baseHost}/ws/live_feed?session_id=demo-session&speed_factor=10`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data ?? "{}");
        const alerts = Array.isArray(payload.alerts) ? payload.alerts : payload.alert ? [payload.alert] : [];
        if (!alerts.length) return;

        setQueue((prev) => {
          const nextQueue = [...prev];
          for (const raw of alerts) {
            const normalized = normalizeAlert(raw);
            if (!normalized) continue;
            if (seenAlertIds.current.has(normalized.id)) continue;
            seenAlertIds.current.add(normalized.id);
            nextQueue.push(normalized);
          }
          return nextQueue;
        });
      } catch (err) {
        // ignore malformed frames
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeAlert && sortedQueue.length) {
      const [next, ...rest] = sortedQueue;
      setActiveAlert(next);
      setQueue(rest);
    }
  }, [sortedQueue, activeAlert]);

  useEffect(() => {
    if (!activeAlert) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setHistory((prev) => {
        const updated = [activeAlert, ...prev];
        return updated.slice(0, HISTORY_LIMIT);
      });
      setActiveAlert(null);
    }, DISPLAY_MS[activeAlert.priority]);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [activeAlert]);

  const toggleHistory = () => setHistoryOpen((prev) => !prev);

  const priorityColors: Record<Priority, string> = {
    high: "bg-red-600 border-red-300",
    medium: "bg-amber-500 border-amber-200",
    low: "bg-cyan-500 border-cyan-200",
  };

  return (
    <section
      className="relative flex h-64 w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-black p-6 text-white shadow-2xl"
      aria-label="Driver heads-up display"
    >
      <header className="flex items-center justify-between text-sm uppercase tracking-wider text-slate-300">
        <span role="heading" aria-level={2} className="font-semibold text-slate-100">
          Driver HUD
        </span>
        <button
          type="button"
          onClick={toggleHistory}
          aria-label={historyOpen ? "Hide recent alerts" : "Show recent alerts"}
          aria-expanded={historyOpen}
          aria-controls="hud-alert-history"
          className="hud-overlay-icon flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            role="img"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6l3 2" />
          </svg>
          <span className="hidden sm:inline">History</span>
        </button>
      </header>

      <div className="flex-1" aria-live="assertive" aria-atomic="true">
        {activeAlert ? (
          <div
            key={activeAlert.id}
            role="alert"
            className={`hud-overlay flex h-full flex-col justify-center gap-2 rounded-2xl border-2 px-6 py-4 text-center text-3xl font-black tracking-tight shadow-lg md:text-4xl ${
              priorityColors[activeAlert.priority]
            }`}
          >
            <span className="text-xs uppercase tracking-[0.4em] text-white/70">{activeAlert.priority} priority</span>
            <span>{activeAlert.message}</span>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-lg font-semibold text-slate-400">
            Awaiting live alerts…
          </div>
        )}
      </div>

      <footer className="flex items-end justify-between text-xs text-slate-400" aria-live="polite">
        <span>Auto-dismiss in {activeAlert ? Math.round(DISPLAY_MS[activeAlert.priority] / 1000) : 0}s</span>
        <span>{queue.length} in queue</span>
      </footer>

      {historyOpen && history.length > 0 && (
        <aside
          id="hud-alert-history"
          className="absolute bottom-6 right-6 w-72 max-w-full rounded-xl border border-white/20 bg-slate-900/95 p-4 text-sm shadow-xl backdrop-blur"
          role="dialog"
          aria-modal="false"
          aria-label="Recent driver alerts"
        >
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-300">Recent alerts</h3>
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className={`rounded-lg border border-white/10 px-3 py-2 text-white ${priorityColors[item.priority]}`}
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/75">
                  <span>{item.priority}</span>
                  <span>{new Date(item.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="mt-1 text-sm font-semibold leading-tight">{item.message}</p>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </section>
  );
}
