"use client";
import React, { useState } from "react";
import StrategyCard from "../components/StrategyCard";
import LiveCharts from "../components/LiveCharts";

export default function DashboardPage() {
  const [sessionId, setSessionId] = useState<string>("demo-session");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">LapLens — Engineer Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <StrategyCard sessionId={sessionId} />
        </div>
        <div className="col-span-2">
          <LiveCharts sessionId={sessionId} />
        </div>
      </div>
    </main>
  );
}
